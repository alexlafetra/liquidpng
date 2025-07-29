import { useState } from 'react'

function LiquidMenuTab({title,defaultState,children}){
    const [active,setActive] = useState(defaultState);

    return(
        <>
        <div className = "liquid_menu_tab">
            <div className = "liquid_menu_tab_title" onClick = {() => {setActive(!active);}}>{title + (active?' ⌄':' ˃')}</div>
            <div className = "liquid_menu_tab_items">
                {active &&
                    <>
                    {children}
                    </>
                }
            </div>
        </div>
        </>
    )
}
export default LiquidMenuTab;