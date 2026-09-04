"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Search
} from "lucide-react";


export default function Venda(){


const [produtos,setProdutos]=useState<any[]>([]);

const [busca,setBusca]=useState("");

const [carrinho,setCarrinho]=useState<any[]>([]);

const [pagamento,setPagamento]=useState("PIX");

const [produtoSelecionado,setProdutoSelecionado]=useState<any>(null);

const [quantidade,setQuantidade]=useState(1);






async function carregarProdutos(){


const {data,error}=await supabase

.from("produtos")

.select("*")

.eq("ativo",true)

.gt("quantidade",0)

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




if(quantidade <=0){

alert("Quantidade inválida");

return;

}



if(quantidade > produtoSelecionado.quantidade){

alert(

`Estoque disponível: ${produtoSelecionado.quantidade}`

);

return;

}







const existente=carrinho.find(

p=>p.id===produtoSelecionado.id

);




if(existente){



const novaQuantidade =
existente.quantidade + quantidade;



if(novaQuantidade > produtoSelecionado.quantidade){

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









function alterarQuantidade(

id:string,

tipo:string

){



setCarrinho(

carrinho.map(item=>{


if(item.id!==id){

return item;

}




if(tipo==="mais"){



if(item.quantidade + 1 > item.quantidade){

return {

...item,

quantidade:item.quantidade+1

}

}


}





if(tipo==="menos"){



if(item.quantidade>1){

return {

...item,

quantidade:item.quantidade-1

}

}



}



return item;


})

);


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

,0);


}









async function finalizarVenda(){



if(carrinho.length===0){

alert("Carrinho vazio");

return;

}






// verificar estoque novamente

for(const item of carrinho){


const {data:produto}=await supabase

.from("produtos")

.select("quantidade")

.eq("id",item.id)

.single();



if(!produto){

alert("Produto não encontrado");

return;

}



if(produto.quantidade < item.quantidade){


alert(

`Estoque insuficiente para ${item.nome}. Disponível: ${produto.quantidade}`

);


return;


}


}








const total=totalVenda();






const {data:venda,error}=await supabase

.from("vendas")

.insert([

{

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






if(error){

alert(error.message);

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

item.preco_venda *
item.quantidade

}

]);







const {data:produtoAtual}=await supabase

.from("produtos")

.select("quantidade")

.eq("id",item.id)

.single();







if(produtoAtual){


const novoEstoque =

produtoAtual.quantidade -
item.quantidade;



await supabase

.from("produtos")

.update({

quantidade:novoEstoque

})

.eq("id",item.id);



}



}








alert("Venda realizada com sucesso!");



setCarrinho([]);

carregarProdutos();


}









useEffect(()=>{


carregarProdutos();


},[]);









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

onChange={
e=>setBusca(e.target.value)
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

hover:border-red-500

"

>


<div className="
flex
justify-between
">


<strong>

{p.nome}

</strong>



<span>

R$ {Number(p.preco_venda).toFixed(2)}

</span>



</div>



<p>

Estoque: {p.quantidade}

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
">


<h3 className="font-black">

{produtoSelecionado.nome}

</h3>


<input

type="number"

min="1"

value={quantidade}

onChange={
e=>setQuantidade(
Number(e.target.value)
)
}

className="
mt-3
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
p-3
rounded-xl
w-full
font-black
"

>

Adicionar

</button>


</div>

)

}



</div>









<div>


<div className="
bg-white
rounded-2xl
p-6
shadow
">


<h2 className="
text-2xl
font-black
mb-5
flex
gap-2
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
"


>


<div>


<b>

{item.nome}

</b>


<p>

{item.quantidade} unidade(s)

</p>


</div>



<button

onClick={()=>removerProduto(item.id)}

className="text-red-600"

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

onChange={
e=>setPagamento(e.target.value)
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


</div>)}