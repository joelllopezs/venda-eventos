"use client";


import {
  useEffect,
  useState
} from "react";


import {
  supabase
} from "@/lib/supabase";


import {
  XMLParser
} from "fast-xml-parser";


import {
  Upload,
  Package,
  Trash2
} from "lucide-react";



export default function Estoque(){



const [produtos,setProdutos]=useState<any[]>([]);

const [arquivo,setArquivo]=useState<File|null>(null);

const [eventoAtual,setEventoAtual]=useState<any>(null);




const [produto,setProduto]=useState({

nome:"",
categoria:"",
estoque:0,
custo:0,
preco_venda:0

});






async function carregarEvento(){


const {data}=await supabase

.from("evento_atual")

.select("evento_id")

.limit(1)

.single();



if(!data?.evento_id){

setEventoAtual(null);

return;

}




const {data:evento}=await supabase

.from("eventos")

.select("*")

.eq("id",data.evento_id)

.single();



setEventoAtual(evento || null);



}








async function carregarProdutos(){



if(!eventoAtual?.id)return;



const {data,error}=await supabase

.from("produtos")

.select("*")

.eq("evento_id",eventoAtual.id)

.order("nome");



if(error){

console.log(error);

return;

}



setProdutos(data || []);



}









async function salvarProduto(){



if(!eventoAtual){

alert("Nenhum evento aberto");

return;

}




const {error}=await supabase

.from("produtos")

.insert([

{

...produto,

evento_id:eventoAtual.id

}

]);



if(error){

alert(error.message);

return;

}



alert("Produto cadastrado!");



setProduto({

nome:"",
categoria:"",
estoque:0,
custo:0,
preco_venda:0

});



carregarProdutos();



}









async function excluirProduto(id:string){



const confirmar=confirm(
"Excluir produto?"
);



if(!confirmar)return;



await supabase

.from("produtos")

.delete()

.eq("id",id);



carregarProdutos();



}









async function importarXML(){



if(!arquivo){

alert("Selecione um XML");

return;

}




if(!eventoAtual){

alert("Abra um evento antes");

return;

}





const texto=await arquivo.text();





const parser=new XMLParser({

ignoreAttributes:false

});





const xml:any=parser.parse(texto);






const infNFe =

xml?.nfeProc?.NFe?.infNFe ||

xml?.NFe?.infNFe;





if(!infNFe){

alert("XML inválido");

return;

}





const fornecedor =

infNFe.emit?.xNome ||

"Fornecedor não informado";






let detalhes = infNFe.det;





if(!Array.isArray(detalhes)){

detalhes=[detalhes];

}





for(const item of detalhes){



const prod=item.prod;



const nome=

prod.xProd;



const quantidade=

Number(prod.qCom || 0);



const valor=

Number(prod.vUnCom || 0);





if(!nome || quantidade<=0){

continue;

}








let produtoExistente;



const {data:produtoBusca}=await supabase

.from("produtos")

.select("*")

.eq("evento_id",eventoAtual.id)

.eq("nome",nome)

.maybeSingle();





produtoExistente=produtoBusca;








let produtoId:string;






if(produtoExistente){



await supabase

.from("produtos")

.update({

estoque:

Number(produtoExistente.estoque)

+

quantidade,

custo:valor

})

.eq("id",produtoExistente.id);




produtoId=produtoExistente.id;



}else{



const {data:novoProduto}=await supabase

.from("produtos")

.insert([

{

evento_id:eventoAtual.id,

nome,

categoria:"XML",

estoque:quantidade,

custo:valor,

preco_venda:0

}

])

.select()

.single();



produtoId=novoProduto.id;



}







await supabase

.from("entradas_estoque")

.insert([

{

produto_id:produtoId,

tipo:"XML",

quantidade,

valor_unitario:valor,

fornecedor

}

]);








await supabase

.from("estoque_movimentos")

.insert([

{

produto_id:produtoId,

tipo:"ENTRADA_XML",

quantidade,

observacao:
"Entrada via NF-e XML"

}

]);




}






alert("XML importado com sucesso!");



setArquivo(null);


carregarProdutos();



}
useEffect(()=>{


carregarEvento();


},[]);





useEffect(()=>{


carregarProdutos();


},[eventoAtual]);








return (

<div>





<h1 className="
text-4xl
font-black
mb-8
text-[#2B1718]
flex
items-center
gap-3
">

<Package/>

Estoque

</h1>







<div className="
bg-white
rounded-2xl
p-8
shadow
border
border-[#F5D7B0]
mb-10
">


<h2 className="
text-2xl
font-black
mb-5
">

📄 Entrada por NF-e XML

</h2>




<p className="
text-[#6B554C]
mb-5
">

Evento atual:

<b className="ml-2 text-[#C9362C]">

{
eventoAtual
?
eventoAtual.nome
:
"Nenhum evento aberto"
}

</b>

</p>






<div className="
flex
flex-col
md:flex-row
gap-4
">


<input

type="file"

accept=".xml"

onChange={e=>
setArquivo(
e.target.files?.[0] || null
)
}

className="
bg-[#FFF8F0]
border
border-[#D99A45]
p-3
rounded-xl
text-black
"

/>





<button

onClick={importarXML}

className="
bg-[#C9362C]
hover:bg-[#A52D25]
text-white
p-3
rounded-xl
font-black
flex
items-center
justify-center
gap-2
"

>

<Upload size={20}/>

Importar NF-e XML

</button>



</div>


</div>









<div className="
bg-white
rounded-2xl
p-8
shadow
border
border-[#F5D7B0]
mb-10
">



<h2 className="
text-2xl
font-black
mb-5
">

➕ Cadastro manual

</h2>






<div className="
grid
gap-4
md:grid-cols-2
">





<input

className="
p-3
rounded-xl
bg-[#FFF8F0]
border
border-[#D99A45]
text-black
"

placeholder="Nome produto"

value={produto.nome}

onChange={e=>

setProduto({

...produto,

nome:e.target.value

})

}

/>








<input

className="
p-3
rounded-xl
bg-[#FFF8F0]
border
border-[#D99A45]
text-black
"

placeholder="Categoria"

value={produto.categoria}

onChange={e=>

setProduto({

...produto,

categoria:e.target.value

})

}

/>








<input

type="number"

className="
p-3
rounded-xl
bg-[#FFF8F0]
border
border-[#D99A45]
text-black
"

placeholder="Estoque"

value={produto.estoque}

onChange={e=>

setProduto({

...produto,

estoque:Number(e.target.value)

})

}

/>








<input

type="number"

className="
p-3
rounded-xl
bg-[#FFF8F0]
border
border-[#D99A45]
text-black
"

placeholder="Custo"

value={produto.custo}

onChange={e=>

setProduto({

...produto,

custo:Number(e.target.value)

})

}

/>








<input

type="number"

className="
p-3
rounded-xl
bg-[#FFF8F0]
border
border-[#D99A45]
text-black
"

placeholder="Preço venda"

value={produto.preco_venda}

onChange={e=>

setProduto({

...produto,

preco_venda:Number(e.target.value)

})

}

/>







</div>






<button

onClick={salvarProduto}

className="
mt-5
bg-[#D99A45]
hover:bg-[#C38738]
text-white
p-4
rounded-xl
font-black
"

>

Salvar Produto

</button>




</div>









<h2 className="
text-2xl
font-black
mb-5
">

Produtos cadastrados

</h2>








<div className="
grid
gap-4
">


{

produtos.map(p=>(


<div

key={p.id}

className="
bg-white
rounded-2xl
p-5
border
border-[#F5D7B0]
shadow
flex
justify-between
items-center
"

>


<div>


<h3 className="
text-xl
font-black
text-[#2B1718]
">

{p.nome}

</h3>



<p className="
text-[#6B554C]
">

Categoria:
{p.categoria}

</p>



</div>






<div className="
text-right
">


<p className="
font-black
text-[#C9362C]
text-xl
">

Estoque:

{p.estoque}

</p>



<p>

R$ {Number(p.preco_venda || 0)
.toFixed(2)}

</p>





<button

onClick={()=>excluirProduto(p.id)}

className="
mt-3
text-[#C9362C]
font-bold
flex
items-center
gap-2
"

>

<Trash2 size={18}/>

Excluir

</button>



</div>






</div>


))

}



</div>






</div>

)

}