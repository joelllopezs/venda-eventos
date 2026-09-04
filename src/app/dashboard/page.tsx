"use client";


import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

import * as XLSX from "xlsx";

import {
DollarSign,
ShoppingCart,
Package,
Download,
Clock,
CreditCard
} from "lucide-react";




export default function Dashboard(){



const [vendas,setVendas]=useState<any[]>([]);

const [itens,setItens]=useState<any[]>([]);

const [produtos,setProdutos]=useState<any[]>([]);






async function carregarDados(){


const {data:v}=await supabase

.from("vendas")

.select("*")

.order("created_at",{ascending:true});





const {data:i}=await supabase

.from("itens_venda")

.select("*");





const {data:p}=await supabase

.from("produtos")

.select("*");






setVendas(v || []);

setItens(i || []);

setProdutos(p || []);



}






useEffect(()=>{


carregarDados();


},[]);








const faturamento = vendas.reduce(

(a,b)=>

a + Number(b.valor_total || 0)

,0);





const quantidadeVendas = vendas.length;





const produtosVendidos = itens.reduce(

(a,b)=>

a + Number(b.quantidade || 0)

,0);






const ticketMedio =

quantidadeVendas

?

faturamento / quantidadeVendas

:

0;









const pagamentos = {


PIX:

somarPagamento("PIX"),


DEBITO:

somarPagamento("DEBITO"),


CREDITO:

somarPagamento("CREDITO"),


DINHEIRO:

somarPagamento("DINHEIRO")


};





function somarPagamento(tipo:string){


return vendas

.filter(v=>

v.forma_pagamento===tipo

)

.reduce(

(a,b)=>

a + Number(b.valor_total || 0)

,0)


}







// faturamento por dia


const porDia:any={};



vendas.forEach(v=>{


const dia=v.data_venda;



if(!porDia[dia]){

porDia[dia]=0;

}


porDia[dia]+=Number(v.valor_total);



});






// vendas por hora


const porHora:any={};



vendas.forEach(v=>{


const hora=

v.hora_venda?.slice(0,2);



if(!porHora[hora]){

porHora[hora]=0;

}


porHora[hora]+=Number(v.valor_total);



});









// ranking produtos


const ranking:any={};



itens.forEach(i=>{


const produto=produtos.find(

p=>p.id===i.produto_id

);



if(produto){


if(!ranking[produto.nome]){

ranking[produto.nome]=0;

}



ranking[produto.nome]+=i.quantidade;


}


});





const produtosRanking=

Object.entries(ranking)

.sort(

(a:any,b:any)=>

b[1]-a[1]

)

.slice(0,5);








function exportarExcel(){



const resumo=[

{

Faturamento:faturamento,

Vendas:quantidadeVendas,

Produtos:produtosVendidos,

TicketMedio:ticketMedio

}

];





const vendasExport=vendas.map(v=>({

Data:v.data_venda,

Hora:v.hora_venda,

Pagamento:v.forma_pagamento,

Valor:v.valor_total

}));







const produtosExport=

produtosRanking.map((p:any)=>({

Produto:p[0],

Quantidade:p[1]

}));








const wb=XLSX.utils.book_new();




XLSX.utils.book_append_sheet(

wb,

XLSX.utils.json_to_sheet(resumo),

"Resumo"

);




XLSX.utils.book_append_sheet(

wb,

XLSX.utils.json_to_sheet(vendasExport),

"Vendas"

);




XLSX.utils.book_append_sheet(

wb,

XLSX.utils.json_to_sheet(produtosExport),

"Produtos"

);






XLSX.writeFile(

wb,

"relatorio_evento.xlsx"

);



}










return (

<div>



<h1 className="
text-3xl
md:text-4xl
font-black
mb-8
text-[#2B1718]
">

📊 Dashboard Evento

</h1>









<div className="
grid
grid-cols-1
sm:grid-cols-2
xl:grid-cols-4
gap-6
mb-10
">





<Card

titulo="Faturamento"

valor={`R$ ${faturamento.toFixed(2)}`}

icon={<DollarSign/>}

/>





<Card

titulo="Vendas"

valor={quantidadeVendas}

icon={<ShoppingCart/>}

/>





<Card

titulo="Produtos"

valor={produtosVendidos}

icon={<Package/>}

/>





<Card

titulo="Ticket Médio"

valor={`R$ ${ticketMedio.toFixed(2)}`}

icon={<CreditCard/>}

/>







</div>









<button

onClick={exportarExcel}

className="
bg-[#C9362C]
text-white
p-4
rounded-xl
font-black
flex
items-center
gap-3
mb-8
"

>


<Download/>

Exportar Relatório Excel


</button>









<div className="
grid
grid-cols-1
lg:grid-cols-2
gap-8
">







<div className="card">


<h2 className="
text-xl
font-black
mb-5
">

📅 Faturamento por dia

</h2>




{

Object.entries(porDia)

.map(([dia,valor]:any)=>(


<p

key={dia}

className="
flex
justify-between
border-b
py-3
"


>

<span>

{dia}

</span>


<b>

R$ {Number(valor).toFixed(2)}

</b>


</p>


))


}




</div>








<div className="card">


<h2 className="
text-xl
font-black
mb-5
">

🕒 Vendas por hora

</h2>




{

Object.entries(porHora)

.map(([hora,valor]:any)=>(



<p

key={hora}

className="
flex
justify-between
border-b
py-3
"


>

<span>

{hora}:00

</span>


<b>

R$ {Number(valor).toFixed(2)}

</b>


</p>



))


}



</div>









<div className="card">


<h2 className="
text-xl
font-black
mb-5
">

🏆 Produtos mais vendidos

</h2>




{

produtosRanking.map((p:any)=>(


<p

key={p[0]}

className="
flex
justify-between
border-b
py-3
"


>


<span>

{p[0]}

</span>



<b>

{p[1]} un.

</b>


</p>


))


}



</div>








<div className="card">


<h2 className="
text-xl
font-black
mb-5
">

💳 Pagamentos

</h2>




<p>PIX: R$ {pagamentos.PIX.toFixed(2)}</p>

<p>Débito: R$ {pagamentos.DEBITO.toFixed(2)}</p>

<p>Crédito: R$ {pagamentos.CREDITO.toFixed(2)}</p>

<p>Dinheiro: R$ {pagamentos.DINHEIRO.toFixed(2)}</p>



</div>






</div>





</div>


)


}







function Card({

titulo,

valor,

icon

}:any){



return (

<div className="
card
">


<div className="
flex
justify-between
items-center
">


<div>


<p className="
text-[#6B554C]
font-bold
">

{titulo}

</p>



<h2 className="
text-3xl
font-black
text-[#C9362C]
mt-3
">

{valor}

</h2>



</div>



<div className="
text-[#D99A45]
">

{icon}

</div>



</div>


</div>


)


}