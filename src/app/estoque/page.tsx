"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

import {
PackagePlus,
Upload,
FileText,
History,
Trash2,
AlertTriangle
} from "lucide-react";

import { XMLParser } from "fast-xml-parser";


export default function Estoque(){


const [produtos,setProdutos]=useState<any[]>([]);

const [entradas,setEntradas]=useState<any[]>([]);

const [mostrarManual,setMostrarManual]=useState(false);




const [produto,setProduto]=useState({

nome:"",
categoria:"",
quantidade:0,
custo:0,
preco_venda:0

});







async function carregarDados(){


const {data:p}=await supabase

.from("produtos")
.select("*")
.eq("ativo",true)
.order("created_at",{ascending:false});




const {data:e}=await supabase

.from("entradas_estoque")

.select(`
*,
produtos(
nome
)
`)

.order("created_at",{ascending:false});



setProdutos(p || []);

setEntradas(e || []);



}







async function excluirProduto(id:string,nome:string){


const confirmar = confirm(
`Deseja remover ${nome} do estoque?`
);


if(!confirmar){

return;

}



const {error}=await supabase

.from("produtos")

.update({

ativo:false

})

.eq("id",id);




if(error){

alert(error.message);

return;

}



alert("Produto removido do estoque!");

carregarDados();


}








function statusEstoque(qtd:number){


if(qtd<=0){

return (

<span className="
text-red-600
font-black
flex
items-center
gap-1
">

🔴 Sem estoque

</span>

)

}



if(qtd<=10){

return (

<span className="
text-yellow-600
font-black
">

🟡 Estoque baixo

</span>

)

}



return (

<span className="
text-green-600
font-black
">

🟢 Normal

</span>

)



}









async function salvarManual(){



const {data:novo,error}=await supabase

.from("produtos")

.insert([produto])

.select()

.single();




if(error){

alert(error.message);

return;

}





await supabase

.from("entradas_estoque")

.insert([

{

produto_id:novo.id,

tipo:"ENTRADA_MANUAL",

quantidade:produto.quantidade,

valor_unitario:produto.custo

}

]);





alert("Produto cadastrado!");

setMostrarManual(false);


carregarDados();



}








useEffect(()=>{


carregarDados();


},[]);









return (

<div>


<h1 className="
text-4xl
font-black
mb-8
text-[#2B1718]
">

📦 Estoque

</h1>






<div className="
grid
grid-cols-1
md:grid-cols-3
gap-6
mb-10
">





<button

onClick={()=>setMostrarManual(true)}

className="
bg-white
p-6
rounded-2xl
shadow
border
border-[#F5D7B0]
text-left
"

>

<PackagePlus/>

<h3 className="
font-black
text-xl
mt-3
">

Entrada Manual

</h3>


<p>

Cadastrar produtos

</p>


</button>







<label

className="
bg-white
p-6
rounded-2xl
shadow
border
border-[#F5D7B0]
cursor-pointer
"

>

<Upload/>

<h3 className="
font-black
text-xl
mt-3
">

Importar XML NF-e

</h3>


<p>

Adicionar estoque via nota

</p>


<input

hidden

type="file"

accept=".xml"

/>


</label>







<button

className="
bg-white
p-6
rounded-2xl
shadow
border
border-[#F5D7B0]
text-left
"

>

<FileText/>

<h3 className="
font-black
text-xl
mt-3
">

Nota Manual

</h3>


<p>

Registrar compra

</p>


</button>



</div>









{
mostrarManual && (

<div className="
bg-white
p-8
rounded-2xl
shadow
border
border-[#F5D7B0]
max-w-xl
mb-10
">


<h2 className="
text-2xl
font-black
mb-5
">

➕ Entrada Manual

</h2>





<div className="grid gap-4">



<input

className="input"

placeholder="Nome"

onChange={
e=>setProduto({

...produto,

nome:e.target.value

})

}

/>





<input

className="input"

placeholder="Categoria"

onChange={
e=>setProduto({

...produto,

categoria:e.target.value

})

}

/>





<input

className="input"

type="number"

placeholder="Quantidade"

onChange={
e=>setProduto({

...produto,

quantidade:Number(e.target.value)

})

}

/>





<input

className="input"

type="number"

placeholder="Custo"

onChange={
e=>setProduto({

...produto,

custo:Number(e.target.value)

})

}

/>





<input

className="input"

type="number"

placeholder="Preço venda"

onChange={
e=>setProduto({

...produto,

preco_venda:Number(e.target.value)

})

}

/>






<button

onClick={salvarManual}

className="
bg-[#C9362C]
text-white
p-4
rounded-xl
font-black
"

>

Salvar Produto

</button>


</div>



</div>

)

}










<h2 className="
text-2xl
font-black
mb-5
">

Produtos cadastrados

</h2>






<div className="
grid
grid-cols-1
lg:grid-cols-2
gap-5
">



{

produtos.map(p=>(


<div

key={p.id}

className="
bg-white
rounded-2xl
p-6
shadow
border
border-[#F5D7B0]
"

>



<div className="
flex
justify-between
"

>


<div>


<h3 className="
text-xl
font-black
">

{p.nome}

</h3>



<p>

Categoria:
{p.categoria}

</p>


</div>




<button

onClick={()=>excluirProduto(p.id,p.nome)}

className="
text-red-600
hover:scale-110
"

>

<Trash2/>

</button>



</div>







<div className="mt-4">


<p className="
font-bold
">

📦 Quantidade:
{p.quantidade}

</p>



{statusEstoque(p.quantidade)}



<p className="mt-2">

Venda:
R$ {Number(p.preco_venda).toFixed(2)}

</p>



</div>




</div>



))

}


</div>








<h2 className="
text-2xl
font-black
mt-10
mb-5
flex
gap-2
">

<History/>

Histórico de entradas

</h2>





{

entradas.map(e=>(


<div

key={e.id}

className="
bg-white
p-4
rounded-xl
mb-3
border
"

>

{e.tipo}

-
{e.quantidade}

unidades

</div>


))

}



</div>


)

}