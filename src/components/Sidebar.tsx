"use client";


import Link from "next/link";


import {
  LayoutDashboard,
  CalendarDays,
  Package,
  ShoppingCart
} from "lucide-react";


import EventoAtual from "@/components/EventoAtual";



export default function Sidebar(){


return (


<aside className="
w-72
min-h-screen
bg-[#2B1718]
text-[#FFF5EA]
p-8
shadow-xl
">





<div className="
mb-8
">


<h1 className="
text-4xl
font-extrabold
tracking-wide
text-[#D99A45]
">

⚡ LOPEX

</h1>


<p className="
text-sm
text-[#FFF5EA]
opacity-70
">

PDV Eventos

</p>


</div>





{/* EVENTO ATUAL */}

<EventoAtual />







<nav className="
space-y-3
mt-8
">



<Menu

href="/dashboard"

icon={<LayoutDashboard/>}

text="Dashboard"

/>





<Menu

href="/eventos"

icon={<CalendarDays/>}

text="Eventos"

/>






<Menu

href="/estoque"

icon={<Package/>}

text="Estoque"

/>






<Menu

href="/venda"

icon={<ShoppingCart/>}

text="Nova Venda"

/>





</nav>





</aside>


)

}








function Menu({

href,

icon,

text

}:any){



return (



<Link

href={href}

className="
flex
items-center
gap-4
p-4
rounded-xl
hover:bg-[#C9362C]
transition
font-bold
"

>



{icon}



<span>

{text}

</span>



</Link>


)

}