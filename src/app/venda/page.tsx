"use client";

import {
  useEffect,
  useState
} from "react";


import {
  supabase
} from "@/lib/supabase";


import {
  useEvento
} from "@/context/EventContext";


import {
  ShoppingCart,
  Trash2,
  CreditCard,
  Search,
  CheckCircle,
  Plus,
  Minus
} from "lucide-react";





export default function Venda(){



const {
  eventoAtual
}=useEvento();




const [
  produtos,
  setProdutos
]=useState<any[]>([]);




const [
  busca,
  setBusca
]=useState("");




const [
  produtoSelecionado,
  setProdutoSelecionado
]=useState<any>(null);




const [
  quantidade,
  setQuantidade
]=useState(1);




const [
  carrinho,
  setCarrinho
]=useState<any[]>([]);




const [
  pagamento,
  setPagamento
]=useState("PIX");




const [
  vendaFinalizada,
  setVendaFinalizada
]=useState(false);




const [
  ultimaVenda,
  setUltimaVenda
]=useState({

total:0,

pagamento:""

});









async function carregarProdutos(){


if(!eventoAtual){

setProdutos([]);

return;

}





const {
data,
error
}=await supabase

.from("produtos")

.select("*")

.eq(
"evento_id",
eventoAtual.id
)

.gt(
"estoque",
0
)

.order("nome");





if(error){

console.log(error);

return;

}



setProdutos(data || []);



}









const produtosFiltrados = produtos.filter(p=>

p.nome

.toLowerCase()

.includes(

busca.toLowerCase()

)

);









function selecionarProduto(produto:any){


setProdutoSelecionado(produto);


setQuantidade(1);


}









function aumentarQuantidade(){



if(!produtoSelecionado){

return;

}



if(

quantidade <

Number(produtoSelecionado.estoque)

){


setQuantidade(

quantidade + 1

);


}



}









function diminuirQuantidade(){



if(

quantidade > 1

){


setQuantidade(

quantidade - 1

);


}


}









function adicionarProduto(){



if(!produtoSelecionado){

return;

}





const existente = carrinho.find(

p=>p.id===produtoSelecionado.id

);






if(existente){



const novaQuantidade =

existente.quantidade +

quantidade;





if(

novaQuantidade >

Number(produtoSelecionado.estoque)

){

alert("Quantidade maior que estoque");

return;

}





setCarrinho(

carrinho.map(p=>

p.id===produtoSelecionado.id

?

{

...p,

quantidade:novaQuantidade

}

:

p

)

);





}else{



setCarrinho([

...carrinho,

{

...produtoSelecionado,

quantidade

}

]);



}




setProdutoSelecionado(null);


setQuantidade(1);



}









function removerProduto(id:string){


setCarrinho(

carrinho.filter(

p=>p.id!==id

)

);


}









function totalVenda(){



return carrinho.reduce(

(total,item)=>

total +

Number(item.preco_venda)

*

item.quantidade

,

0

);


}









useEffect(()=>{


carregarProdutos();


},[eventoAtual]);
async function finalizarVenda(){


if(!eventoAtual){

alert("Nenhum evento aberto.");

return;

}



if(carrinho.length===0){

alert("Carrinho vazio.");

return;

}



// CONFERE ESTOQUE ATUAL ANTES DE FINALIZAR

for(const item of carrinho){


const {
data:produtoAtual,
error:erroProduto
}=await supabase

.from("produtos")

.select("estoque")

.eq(
"id",
item.id
)

.single();



if(
erroProduto ||
!produtoAtual
){

alert(
`Não foi possível consultar o estoque de ${item.nome}.`
);

return;

}



if(
Number(produtoAtual.estoque)
<
Number(item.quantidade)
){

alert(
`Estoque insuficiente para ${item.nome}.\nDisponível: ${produtoAtual.estoque}`
);

return;

}


}




const total=totalVenda();




// DATA/HORA LOCAL SEM PROBLEMA DE FUSO

const agora=new Date();


const ano=
agora.getFullYear();


const mes=
String(
agora.getMonth()+1
).padStart(2,"0");


const dia=
String(
agora.getDate()
).padStart(2,"0");


const dataVenda=
`${ano}-${mes}-${dia}`;


const horaVenda=
agora.toLocaleTimeString(
"pt-BR",
{
hour12:false
}
);




// CRIA VENDA

const {
data:venda,
error:erroVenda
}=await supabase

.from("vendas")

.insert([

{

evento_id:eventoAtual.id,

valor_total:total,

forma_pagamento:pagamento,

data_venda:dataVenda,

hora_venda:horaVenda

}

])

.select()

.single();



if(erroVenda){

alert(
`Erro ao registrar venda: ${erroVenda.message}`
);

return;

}




// ITENS + BAIXA DE ESTOQUE

for(const item of carrinho){


// REGISTRA ITEM

const {
error:erroItem
}=await supabase

.from("itens_venda")

.insert([

{

venda_id:venda.id,

produto_id:item.id,

quantidade:item.quantidade,

valor_unitario:
Number(item.preco_venda),

subtotal:
Number(item.preco_venda)
*
Number(item.quantidade)

}

]);



if(erroItem){

alert(
`Erro ao registrar ${item.nome}: ${erroItem.message}`
);

return;

}




// CONSULTA O ESTOQUE NOVAMENTE

const {
data:produtoAtual,
error:erroEstoque
}=await supabase

.from("produtos")

.select("estoque")

.eq(
"id",
item.id
)

.single();



if(
erroEstoque ||
!produtoAtual
){

alert(
`Erro ao atualizar estoque de ${item.nome}.`
);

return;

}



const novoEstoque=

Number(produtoAtual.estoque)

-

Number(item.quantidade);




// ATUALIZA PRODUTO

const {
error:erroAtualizacao
}=await supabase

.from("produtos")

.update({

estoque:novoEstoque

})

.eq(
"id",
item.id
);



if(erroAtualizacao){

alert(
`Erro na baixa de estoque de ${item.nome}: ${erroAtualizacao.message}`
);

return;

}




// HISTÓRICO DE MOVIMENTAÇÃO

const {
error:erroMovimento
}=await supabase

.from("estoque_movimentos")

.insert([

{

produto_id:item.id,

tipo:"SAIDA_VENDA",

quantidade:item.quantidade,

observacao:
`Venda ${pagamento} - Evento: ${eventoAtual.nome}`

}

]);



if(erroMovimento){

console.log(
"Erro ao registrar movimentação:",
erroMovimento.message
);

}


}




// GUARDA RESUMO DA VENDA

setUltimaVenda({

total:total,

pagamento:pagamento

});



setVendaFinalizada(true);



// LIMPA OPERAÇÃO

setCarrinho([]);

setProdutoSelecionado(null);

setQuantidade(1);

setBusca("");



// ATUALIZA LISTA/ESTOQUE

await carregarProdutos();


}







function novaVenda(){


setVendaFinalizada(false);

setCarrinho([]);

setProdutoSelecionado(null);

setQuantidade(1);

setBusca("");

setPagamento("PIX");


}

return (

<div
className="
h-[calc(100vh-100px)]
flex
flex-col
"
>


<h1
className="
text-3xl
font-black
text-[#2B1718]
mb-4
"
>

🛒 Nova Venda

</h1>





{
vendaFinalizada && (

<div
className="
bg-white
border
border-green-500
rounded-xl
p-4
mb-3
text-center
"
>


<CheckCircle

className="
mx-auto
text-green-600
mb-2
"

/>



<h2
className="
font-black
text-xl
"
>

Venda realizada com sucesso!

</h2>




<p
className="
font-bold
mt-2
"
>

R$ {ultimaVenda.total.toFixed(2)}

</p>





<button

onClick={novaVenda}

className="
mt-3
bg-[#C9362C]
text-white
rounded-xl
p-3
w-full
font-black
"

>

🛒 Iniciar nova venda

</button>



</div>

)

}








<div
className="
grid
grid-cols-1
lg:grid-cols-2
gap-5
flex-1
min-h-0
"
>










{/* PRODUTOS */}


<div
className="
flex
flex-col
min-h-0
"
>







{/* PESQUISA */}


<div
className="
bg-white
rounded-xl
border
p-3
mb-3
"
>


<div
className="
flex
items-center
gap-2
bg-[#FFF8F0]
rounded-lg
p-3
"
>


<Search size={20}/>



<input

className="
outline-none
bg-transparent
w-full
"

placeholder="Pesquisar produto..."

value={busca}

onChange={e=>
setBusca(e.target.value)
}

/>



</div>



</div>









{/* LISTA PRODUTOS */}


<div
className="
bg-white
rounded-xl
border
p-3
flex-1
overflow-y-auto
"
>





{

produtosFiltrados.map(p=>(


<div

key={p.id}

onClick={()=>selecionarProduto(p)}

className={`
rounded-xl
border
p-3
mb-2
cursor-pointer
transition

${
produtoSelecionado?.id===p.id

?

"border-[#C9362C] bg-[#FFF8F0]"

:

"border-[#E5D8CD]"

}

`

}

>


<div

className="
flex
justify-between
gap-3
"

>


<p

className="
font-bold
text-sm
"

>

{p.nome}

</p>





<strong

className="
text-[#C9362C]
text-sm
whitespace-nowrap
"

>

R$ {Number(p.preco_venda).toFixed(2)}

</strong>




</div>





<p

className="
text-xs
text-[#6B554C]
mt-1
"

>

Estoque: {p.estoque}

</p>




</div>


))


}



</div>










{/* PRODUTO SELECIONADO */}



{

produtoSelecionado && (


<div

className="
bg-[#FFF8F0]
border
border-[#D99A45]
rounded-xl
p-3
mt-3
"

>



<p

className="
font-black
text-sm
truncate
"

>

{produtoSelecionado.nome}

</p>







<div

className="
flex
items-center
justify-between
mt-3
"

>




<div

className="
flex
items-center
gap-3
"

>



<button

onClick={diminuirQuantidade}

className="
bg-white
border
rounded-lg
p-2
"

>

<Minus size={18}/>

</button>







<span

className="
font-black
text-lg
"

>

{quantidade}

</span>







<button

onClick={aumentarQuantidade}

className="
bg-white
border
rounded-lg
p-2
"

>

<Plus size={18}/>

</button>





</div>








<button

onClick={adicionarProduto}

className="
bg-[#C9362C]
text-white
rounded-lg
px-6
py-2
font-black
"

>

Adicionar

</button>





</div>




</div>


)

}









</div>













{/* CARRINHO */}



<div

className="
bg-white
rounded-xl
border
p-4
flex
flex-col
min-h-0
"

>



<h2

className="
font-black
text-xl
flex
items-center
gap-2
mb-4
"

>

<ShoppingCart/>

Carrinho

</h2>







<div

className="
flex-1
overflow-y-auto
"

>





{

carrinho.length===0

?

(

<div

className="
text-center
text-[#6B554C]
mt-10
"

>

🛒


<p

className="
font-bold
mt-2
"

>

Nenhum item

</p>



</div>

)

:

(

carrinho.map(item=>(



<div

key={item.id}

className="
bg-[#F7EFE7]
rounded-xl
p-3
mb-2
flex
justify-between
items-center
"

>


<div>


<p

className="
font-bold
text-sm
"

>

{item.nome}

</p>




<p

className="
text-xs
"

>

{item.quantidade} unidade(s)

</p>



</div>





<button

onClick={()=>removerProduto(item.id)}

className="
text-red-600
"

>

<Trash2 size={20}/>

</button>





</div>


))


)

}




</div>








<div

className="
border-t
pt-4
"

>



<h2

className="
text-3xl
font-black
"

>

R$ {totalVenda().toFixed(2)}

</h2>







<select

value={pagamento}

onChange={e=>
setPagamento(e.target.value)
}

className="
w-full
border
rounded-xl
p-3
mt-3
"

>


<option>PIX</option>

<option>DEBITO</option>

<option>CREDITO</option>

<option>DINHEIRO</option>


</select>








<button

onClick={finalizarVenda}

className="
mt-3
bg-[#D99A45]
text-white
rounded-xl
p-3
w-full
font-black
flex
justify-center
items-center
gap-2
"

>


<CreditCard size={20}/>


FINALIZAR VENDA


</button>




</div>





</div>







</div>







</div>

)

}