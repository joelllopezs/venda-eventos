"use client";


import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";


import { supabase } from "@/lib/supabase";





type Evento = {

  id:string;

  nome:string;

  local?:string;

  data_inicio:string;

  data_fim:string;

};






type EventContextType = {

  eventoAtual: Evento | null;

  carregarEvento: () => Promise<void>;

};







const EventContext = createContext<EventContextType>({

  eventoAtual:null,

  carregarEvento:async()=>{}

});









export function EventProvider({

children

}:{

children:React.ReactNode

}){





const [eventoAtual,setEventoAtual]=
useState<Evento | null>(null);









async function carregarEvento(){



console.log("Buscando evento atual...");





// Busca qual evento está aberto

const {data:atual,error:erroAtual}=await supabase

.from("evento_atual")

.select("evento_id")

.limit(1)

.maybeSingle();






if(erroAtual){


console.log(
"Erro evento_atual:",
erroAtual.message
);


setEventoAtual(null);


return;

}






if(!atual?.evento_id){


console.log(
"Nenhum evento aberto"
);


setEventoAtual(null);


return;

}









// Busca os dados do evento

const {data:evento,error:erroEvento}=await supabase

.from("eventos")

.select("*")

.eq("id",atual.evento_id)

.single();








if(erroEvento){


console.log(
"Erro buscando evento:",
erroEvento.message
);


setEventoAtual(null);


return;

}







console.log(
"Evento encontrado:",
evento
);




setEventoAtual(evento);




}









useEffect(()=>{


carregarEvento();


},[]);









return (

<EventContext.Provider

value={{

eventoAtual,

carregarEvento

}}

>


{children}


</EventContext.Provider>

)


}









export function useEvento(){


return useContext(EventContext);


}