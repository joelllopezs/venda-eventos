"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

import {
  CalendarDays,
  PlayCircle
} from "lucide-react";

import { useEvento } from "@/context/EventContext";



export default function Eventos(){


const { carregarEvento } = useEvento();



const [eventos,setEventos]=useState<any[]>([]);



const [evento,setEvento]=useState({

nome:"",

local:"",

data_inicio:"",

data_fim:"",

saldo_inicial:0

});







async function carregarEventos(){


const {data,error}=await supabase

.from("eventos")

.select("*")

.order("data_inicio",{ascending:false});



if(error){

console.log(error);

return;

}


setEventos(data || []);


}









async function definirEventoAtual(id:string){



// remove evento atual existente

const {error:deleteError}=await supabase

.from("evento_atual")

.delete()
.not("evento_id","is",null);




if(deleteError){

console.log(
"Erro limpando evento atual",
deleteError
);

}







// cria novo evento atual


const {error}=await supabase

.from("evento_atual")

.insert([

{

evento_id:id

}

]);





if(error){

alert(error.message);

return;

}





// atualiza o contexto

await carregarEvento();



}









async function criarEvento(){



const {data,error}=await supabase

.from("eventos")

.insert([evento])

.select()

.single();





if(error){

alert(error.message);

return;

}





await definirEventoAtual(data.id);





alert("Evento criado e aberto!");




setEvento({

nome:"",

local:"",

data_inicio:"",

data_fim:"",

saldo_inicial:0

});



carregarEventos();


}









async function abrirEvento(id:string){



await definirEventoAtual(id);



alert("Evento aberto!");



}








useEffect(()=>{


carregarEventos();


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

<CalendarDays/>

Eventos

</h1>









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

🎪 Criar Evento

</h2>





<div className="grid gap-4">





<input

className="
p-3
rounded-xl
bg-[#FFF8F0]
border
border-[#D99A45]
text-black
"

placeholder="Nome do evento"

value={evento.nome}

onChange={e=>

setEvento({

...evento,

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

placeholder="Local"

value={evento.local}

onChange={e=>

setEvento({

...evento,

local:e.target.value

})

}

/>







<label>

Data início

</label>


<input

type="date"

className="
p-3
rounded-xl
bg-[#FFF8F0]
border
border-[#D99A45]
text-black
"

value={evento.data_inicio}

onChange={e=>

setEvento({

...evento,

data_inicio:e.target.value

})

}

/>







<label>

Data fim

</label>


<input

type="date"

className="
p-3
rounded-xl
bg-[#FFF8F0]
border
border-[#D99A45]
text-black
"

value={evento.data_fim}

onChange={e=>

setEvento({

...evento,

data_fim:e.target.value

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

placeholder="Saldo inicial caixa"

value={evento.saldo_inicial}

onChange={e=>

setEvento({

...evento,

saldo_inicial:Number(e.target.value)

})

}

/>








<button

onClick={criarEvento}

className="
bg-[#C9362C]
hover:bg-[#A52D25]
text-white
p-4
rounded-xl
font-black
"

>

🚀 Criar e Abrir Evento

</button>



</div>


</div>









<h2 className="
text-2xl
font-black
mb-5
">

Eventos cadastrados

</h2>







<div className="
grid
gap-5
">





{

eventos.map(e=>(


<div

key={e.id}

className="
bg-white
p-6
rounded-2xl
shadow
border
border-[#F5D7B0]
flex
justify-between
items-center
"

>


<div>


<h3 className="
text-xl
font-black
">

{e.nome}

</h3>



<p>

📍 {e.local}

</p>



<p>

📅 {e.data_inicio} até {e.data_fim}

</p>



</div>







<button

onClick={()=>abrirEvento(e.id)}

className="
bg-[#D99A45]
text-white
p-3
rounded-xl
font-black
flex
gap-2
items-center
"

>

<PlayCircle size={20}/>

Abrir

</button>





</div>


))


}



</div>




</div>

)

}