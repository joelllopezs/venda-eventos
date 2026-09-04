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
  CheckCircle
} from "lucide-react";




export default function Venda(){



const {eventoAtual}=useEvento();



const [produtos,setProdutos]=useState<any[]>([]);


const [busca,setBusca]=useState("");


const [carrinho,setCarrinho]=useState<any[]>([]);



const [pagamento,setPagamento]=useState("PIX");



const [produtoSelecionado,setProdutoSelecionado]=useState<any>(null);



const [quantidade,setQuantidade]=useState(1);



const [vendaFinalizada,setVendaFinalizada]=useState(false);



const [ultimaVenda,setUltimaVenda]=useState({

total:0,

pagamento:""

});








async function carregarProdutos(){


if(!eventoAtual){

setProdutos([]);

return;

}




const {data,error}=await supabase

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









function adicionarProduto(){



if(!produtoSelecionado){

alert("Selecione um produto");

return;

}





if(
quantidade<=0
){

alert("Quantidade inválida");

return;

}






if(
quantidade >
produtoSelecionado.estoque
){

alert(

`Estoque disponível: ${produtoSelecionado.estoque}`

);


return;

}





const existente = carrinho.find(

p=>p.id===produtoSelecionado.id

);





if(existente){



const novaQuantidade =

existente.quantidade + quantidade;





if(
novaQuantidade >
produtoSelecionado.estoque
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




setQuantidade(1);

setProdutoSelecionado(null);



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

item.quantidade,

0

);


}





useEffect(()=>{


carregarProdutos();


},[eventoAtual]);

async function finalizarVenda(){



if(!eventoAtual){

alert("Nenhum evento aberto");

return;

}




if(carrinho.length===0){

alert("Carrinho vazio");

return;

}






// Confere estoque novamente antes de vender

for(const item of carrinho){



const {data:produto,error}=await supabase

.from("produtos")

.select("estoque")

.eq("id",item.id)

.single();





if(error || !produto){

alert(
`Produto não encontrado: ${item.nome}`
);

return;

}





if(
produto.estoque < item.quantidade
){

alert(

`Estoque insuficiente para ${item.nome}. Disponível: ${produto.estoque}`

);


return;

}



}









const total = totalVenda();







const {data:venda,error:vendaError}=await supabase

.from("vendas")

.insert([

{

evento_id:eventoAtual.id,

valor_total:total,

forma_pagamento:pagamento,

data_venda:

new Date()

.toISOString()

.split("T")[0],

hora_venda:

new Date()

.toLocaleTimeString()

}

])

.select()

.single();







if(vendaError){

alert(vendaError.message);

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

item.quantidade

}

]);










const novoEstoque =

Number(item.estoque)

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








await supabase

.from("estoque_movimentos")

.insert([

{

produto_id:item.id,

tipo:"SAIDA_VENDA",

quantidade:item.quantidade,

observacao:
`Venda realizada - ${pagamento}`

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



carregarProdutos();



}









function novaVenda(){



setVendaFinalizada(false);

setCarrinho([]);

setProdutoSelecionado(null);

setQuantidade(1);

setBusca("");



}

return (

<div>


<h1 className="
text-4xl
font-black
mb-8
text-[#2B1718]
flex
gap-3
items-center
">

🛒 Nova Venda

</h1>





{
vendaFinalizada && (

<div className="
bg-white
rounded-2xl
p-8
shadow-xl
border
border-[#D99A45]
mb-8
text-center
">


<CheckCircle

size={70}

className="
mx-auto
text-green-600
mb-5
"

/>



<h2 className="
text-3xl
font-black
text-[#2B1718]
">

Venda realizada com sucesso!

</h2>




<p className="
mt-4
text-xl
font-bold
">

Total:

R$ {ultimaVenda.total.toFixed(2)}

</p>




<p className="
mt-2
text-[#6B554C]
font-bold
">

Pagamento:

{ultimaVenda.pagamento}

</p>







<button

onClick={novaVenda}

className="
mt-6
bg-[#C9362C]
text-white
p-4
rounded-xl
font-black
w-full
"

>

🛒 Iniciar Nova Venda

</button>



</div>

)

}









<div className="
grid
grid-cols-1
lg:grid-cols-2
gap-8
">







<div>



<h2 className="
text-2xl
font-black
mb-5
">

Produtos

</h2>






<div className="
bg-white
p-5
rounded-2xl
shadow
border
border-[#F5D7B0]
">





<div className="
flex
gap-3
items-center
bg-[#FFF8F0]
p-3
rounded-xl
mb-5
">


<Search/>


<input

className="
bg-transparent
outline-none
w-full
"

placeholder="Pesquisar produto"

value={busca}

onChange={e=>
setBusca(e.target.value)
}

/>


</div>







{

produtosFiltrados.map(p=>(


<div

key={p.id}

onClick={()=>setProdutoSelecionado(p)}

className="
p-4
rounded-xl
mb-3
cursor-pointer
border
hover:border-[#C9362C]
transition
"

>


<div className="
flex
justify-between
gap-3
">


<strong>

{p.nome}

</strong>



<span className="
font-black
text-[#C9362C]
">

R$ {Number(
p.preco_venda
)
.toFixed(2)}

</span>


</div>




<p className="
mt-2
text-[#6B554C]
">

Estoque:

{p.estoque}

</p>



</div>


))

}



</div>








{
produtoSelecionado && (

<div className="
mt-5
bg-white
p-5
rounded-xl
border
border-[#D99A45]
">



<h3 className="
font-black
text-xl
">

{produtoSelecionado.nome}

</h3>





<input

type="number"

min="1"

value={quantidade}

onChange={e=>
setQuantidade(
Number(e.target.value)
)
}

className="
mt-4
p-3
border
rounded-xl
w-full
"

 />







<button

onClick={adicionarProduto}

className="
mt-4
bg-[#C9362C]
text-white
p-4
rounded-xl
w-full
font-black
"

>

Adicionar ao carrinho

</button>



</div>

)

}





</div>



</div>










<div>


<div className="
bg-white
rounded-2xl
p-6
shadow
border
border-[#F5D7B0]
">



<h2 className="
text-2xl
font-black
mb-5
flex
gap-2
items-center
">

<ShoppingCart/>

Carrinho

</h2>








{

carrinho.map(item=>(


<div

key={item.id}

className="
bg-[#F7EFE7]
p-4
rounded-xl
mb-3
flex
justify-between
items-center
"

>


<div>


<b>

{item.nome}

</b>



<p>

{item.quantidade}

unidade(s)

</p>


</div>




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









<h2 className="
text-3xl
font-black
mt-6
">

Total:

R$ {totalVenda().toFixed(2)}

</h2>








<select

value={pagamento}

onChange={e=>
setPagamento(e.target.value)
}

className="
w-full
p-4
mt-5
rounded-xl
border
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
mt-5
bg-[#D99A45]
text-white
p-4
rounded-xl
w-full
font-black
flex
justify-center
gap-3
"

>

<CreditCard/>

FINALIZAR VENDA


</button>





</div>


</div>







</div>


)

}