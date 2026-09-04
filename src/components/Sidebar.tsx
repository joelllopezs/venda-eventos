"use client";


import Link from "next/link";


import {
  useState
} from "react";


import {
  LayoutDashboard,
  CalendarDays,
  Package,
  ShoppingCart,
  Menu as MenuIcon,
  X
} from "lucide-react";


import EventoAtual from "@/components/EventoAtual";





export default function Sidebar(){



const [
aberto,
setAberto
]=useState(false);





function fecharMenu(){

setAberto(false);

}





return (


<>



{/* DESKTOP */}



<aside className="
hidden
md:flex
w-72
min-h-screen
bg-[#2B1718]
text-[#FFF5EA]
p-8
shadow-xl
flex-col
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









{/* MOBILE */}



<div className="
md:hidden
">







{/* TOPO MOBILE */}



<header className="
bg-[#2B1718]
text-[#FFF5EA]
p-4
flex
items-center
gap-4
shadow-lg
sticky
top-0
z-40
">



<button

onClick={()=>setAberto(true)}

className="
bg-[#D99A45]
text-[#2B1718]
p-2
rounded-lg
"

>


<MenuIcon size={24}/>


</button>






<div>


<h1 className="
text-xl
font-black
text-[#D99A45]
">

⚡ LOPEX

</h1>


<p className="
text-xs
opacity-70
">

PDV Eventos

</p>


</div>






</header>








{/* FUNDO ESCURO */}



{

aberto && (

<div

onClick={fecharMenu}

className="
fixed
inset-0
bg-black/50
z-40
"

></div>

)

}









{/* MENU DESLIZANTE */}



<aside

className={`
fixed
top-0
left-0
h-full
w-80
bg-[#2B1718]
text-[#FFF5EA]
p-6
z-50
shadow-2xl
transition-transform
duration-300

${
aberto

?

"translate-x-0"

:

"-translate-x-full"

}

`}

>






<div className="
flex
justify-between
items-center
mb-6
">



<h1 className="
text-3xl
font-black
text-[#D99A45]
">

⚡ LOPEX

</h1>




<button

onClick={fecharMenu}

>

<X size={28}/>

</button>



</div>








<EventoAtual />







<nav className="
space-y-3
mt-6
">





<Menu

href="/dashboard"

icon={<LayoutDashboard/>}

text="Dashboard"

onClick={fecharMenu}

/>






<Menu

href="/eventos"

icon={<CalendarDays/>}

text="Eventos"

onClick={fecharMenu}

/>






<Menu

href="/estoque"

icon={<Package/>}

text="Estoque"

onClick={fecharMenu}

/>






<Menu

href="/venda"

icon={<ShoppingCart/>}

text="Nova Venda"

onClick={fecharMenu}

/>






</nav>







</aside>







</div>







</>

)

}










function Menu({

href,

icon,

text,

onClick

}:any){





return (



<Link

href={href}

onClick={onClick}

className="
flex
items-center
gap-4
p-4
rounded-xl
hover:bg-[#C9362C]
active:bg-[#C9362C]
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