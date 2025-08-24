import { useState } from 'react'

function LiquidMenuTab({title,background,defaultState,children}){
    const [active,setActive] = useState(defaultState);

    return(
        <>
        <div className = "liquid_menu_tab">
            <div className = "liquid_menu_tab_title" style = {{backgroundColor:background,paddingLeft:'5px',paddingRight:'5px'}} onClick = {() => {setActive(!active);}}>{title + (active?' ⌄':' ˃')}</div>
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