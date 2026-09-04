"use client";


import {
  CalendarDays
} from "lucide-react";


import {
  useEvento
} from "@/context/EventContext";



export default function EventoAtual(){


const {eventoAtual}=useEvento();





if(!eventoAtual){

return (

<div className="
bg-white
rounded-2xl
p-5
mb-5
shadow-xl
border
border-[#F5D7B0]
">


<p className="
font-black
text-[#2B1718]
text-lg
">

🎪 Nenhum evento selecionado

</p>



<p className="
text-[#6B554C]
mt-2
text-sm
">

Selecione um evento para iniciar

</p>



</div>

)

}







return (

<div className="
bg-[#2B1718]
rounded-2xl
p-5
mb-5
shadow-xl
border
border-[#D99A45]
">





<div className="
flex
items-center
gap-3
mb-4
">



<div className="
bg-[#D99A45]
p-2
rounded-lg
text-[#2B1718]
">

<CalendarDays size={22}/>

</div>





<span className="
font-black
text-[#FFD8A8]
text-lg
">

Evento Atual

</span>



</div>







<h2
style={{
  color:"#FFFFFF",
  opacity:1
}}
className="
text-2xl
font-black
leading-tight
mt-3
"
>

{eventoAtual.nome}

</h2>







{
eventoAtual.local && (

<p className="
mt-3
text-[#FFF5EA]
font-bold
text-base
">

📍 {eventoAtual.local}

</p>

)

}







<div className="
mt-4
bg-[#FFF5EA]
rounded-xl
p-4
border
border-[#D99A45]
">



<p className="
text-[#8B4A22]
font-black
text-sm
">

📅 Período do evento

</p>






<p className="
text-[#2B1718]
font-black
mt-2
text-lg
">


{
new Date(
eventoAtual.data_inicio
)
.toLocaleDateString("pt-BR")
}



&nbsp; até &nbsp;



{
new Date(
eventoAtual.data_fim
)
.toLocaleDateString("pt-BR")
}



</p>





</div>






</div>

)

}