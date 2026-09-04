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
  Minus,
  X
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
mostrarCarrinhoMobile,
setMostrarCarrinhoMobile
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






for(const item of carrinho){



const {
data:produto,
error
}=await supabase

.from("produtos")

.select("estoque")

.eq(
"id",
item.id
)

.single();





if(error || !produto){

alert(
`Produto não encontrado: ${item.nome}`
);

return;

}





if(
Number(produto.estoque)
<
Number(item.quantidade)
){

alert(

`Estoque insuficiente para ${item.nome}`

);

return;

}



}









const total=totalVenda();





const agora=new Date();



const dataVenda =

`${agora.getFullYear()}-${
String(
agora.getMonth()+1
).padStart(2,"0")
}-${
String(
agora.getDate()
).padStart(2,"0")
}`;






const horaVenda =

agora.toLocaleTimeString(
"pt-BR",
{
hour12:false
}
);









const {
data:venda,
error:vendaError
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






if(vendaError){

alert(
vendaError.message
);

return;

}









for(const item of carrinho){



await supabase

.from("itens_venda")

.insert([

{

venda_id:venda.id,

produto_id:item.id,

quantidade:item.quantidade,

valor_unitario:item.preco_venda,

subtotal:

Number(item.preco_venda)

*

Number(item.quantidade)

}

]);









const {
data:produtoAtual
}=await supabase

.from("produtos")

.select("estoque")

.eq(
"id",
item.id
)

.single();







if(produtoAtual){



const novoEstoque =

Number(produtoAtual.estoque)

-

Number(item.quantidade);







await supabase

.from("produtos")

.update({

estoque:novoEstoque

})

.eq(
"id",
item.id
);



}









await supabase

.from("estoque_movimentos")

.insert([

{

produto_id:item.id,

tipo:"SAIDA_VENDA",

quantidade:item.quantidade,

observacao:

`Venda ${pagamento} - ${eventoAtual.nome}`

}

]);



}









setUltimaVenda({

total,

pagamento

});






setVendaFinalizada(true);





setCarrinho([]);



setProdutoSelecionado(null);



setQuantidade(1);



setMostrarCarrinhoMobile(false);



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









function abrirCarrinhoMobile(){


setMostrarCarrinhoMobile(true);


}









function fecharCarrinhoMobile(){


setMostrarCarrinhoMobile(false);


}
return (

<div
className="
min-h-screen
pb-20
"
>



<h1
className="
text-3xl
font-black
mb-4
text-[#2B1718]
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
mb-4
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

🛒 Nova Venda

</button>



</div>

)

}










<div
className="
grid
grid-cols-1
lg:grid-cols-2
gap-4
"
>









{/* PRODUTOS */}



<div
className="
flex
flex-col
"
>







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
bg-transparent
outline-none
w-full
text-base
"

placeholder="Buscar produto..."

value={busca}

onChange={
e=>setBusca(e.target.value)
}

/>



</div>



</div>









{
produtoSelecionado && (

<div
className="
bg-[#FFF8F0]
border
border-[#D99A45]
rounded-xl
p-3
mb-3
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
text-xl
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
px-5
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









<div
className="
bg-white
rounded-xl
border
p-3
max-h-[55vh]
overflow-y-auto
"
>





{

produtosFiltrados.map(p=>(


<div

key={p.id}

onClick={()=>selecionarProduto(p)}

className="
border
rounded-xl
p-3
mb-2
cursor-pointer
hover:border-[#C9362C]
"

>


<div
className="
flex
justify-between
gap-2
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




<span
className="
text-[#C9362C]
font-black
text-sm
"
>

R$
{Number(p.preco_venda).toFixed(2)}

</span>



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






</div>












{/* CARRINHO DESKTOP */}



<div
className="
hidden
lg:flex
bg-white
rounded-xl
border
p-4
flex-col
"
>



<h2
className="
font-black
text-xl
flex
items-center
gap-2
mb-3
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

carrinho.map(item=>(


<div

key={item.id}

className="
bg-[#F7EFE7]
rounded-lg
p-3
mb-2
flex
justify-between
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

<Trash2 size={18}/>

</button>




</div>


))


}


</div>









<h2
className="
text-2xl
font-black
mt-3
"
>

R$ {totalVenda().toFixed(2)}

</h2>








<select

value={pagamento}

onChange={
e=>setPagamento(e.target.value)
}

className="
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
font-black
"

>

<CreditCard size={18}/>

FINALIZAR

</button>





</div>









</div>













{/* BOTÃO CARRINHO MOBILE */}



<div
className="
lg:hidden
fixed
bottom-4
left-4
right-4
"
>


<button

onClick={abrirCarrinhoMobile}

className="
bg-[#2B1718]
text-white
rounded-xl
p-4
w-full
font-black
shadow-xl
flex
justify-between
"

>


<span>

🛒 Carrinho

</span>



<span>

R$ {totalVenda().toFixed(2)}

</span>


</button>


</div>













{/* MODAL CARRINHO MOBILE */}



{

mostrarCarrinhoMobile && (


<div
className="
fixed
inset-0
bg-black/50
z-50
flex
items-end
lg:hidden
"
>



<div
className="
bg-white
w-full
rounded-t-3xl
p-5
max-h-[80vh]
"
>



<div
className="
flex
justify-between
items-center
mb-4
"
>


<h2
className="
font-black
text-xl
"
>

Carrinho

</h2>




<button

onClick={fecharCarrinhoMobile}

>

<X/>

</button>



</div>







{

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
"

>


<span
className="
font-bold
"
>

{item.nome}

</span>


<button

onClick={()=>removerProduto(item.id)}

className="
text-red-600
"

>

<Trash2/>

</button>



</div>


))


}







<h2
className="
text-3xl
font-black
mt-4
"
>

R$ {totalVenda().toFixed(2)}

</h2>







<select

value={pagamento}

onChange={
e=>setPagamento(e.target.value)
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
p-4
w-full
font-black
"

>

💳 FINALIZAR VENDA

</button>





</div>


</div>


)

}



</div>

)

}