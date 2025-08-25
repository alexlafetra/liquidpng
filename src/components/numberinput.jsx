import { NumberField } from '@base-ui-components/react/number-field';
import { useState } from 'react'

function NumberInput({name,value,min,max,callback}){
    const handleValueChange = (newValue,event) => {
        callback(newValue);
    }
    const handleInputChange = (e) => {
        let val = parseInt(e.target.value);
        if(val > max){
            val = max;
        }
        else if(val < min){
            val = min;
        }
        callback(val);
    }
    return(
    <NumberField.Root className = "number_input_container" min = {min} max = {max} name = {name} value = {value} onValueChange = {handleValueChange}>
    <div className = "number_input_label">{name}</div>
    <NumberField.Group className = "number_input">
        <NumberField.Input className = "number_input_box" onChange = {handleInputChange} ></NumberField.Input>
    </NumberField.Group>
    </NumberField.Root>
    );
}
export default NumberInput;