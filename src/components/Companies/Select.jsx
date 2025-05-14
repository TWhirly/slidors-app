import * as React from 'react';
import { useContext, useState, useEffect } from 'react';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';

import { DataContext } from '../../DataContext';
import styles from './CompanyEditForm.module.css';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

const BasicSelect = (props) => {
    const { regions: contextRegions } = useContext(DataContext);
    const [regionsWithCompanies, setRegionsWithCompanies] = useState([]);
    const focusedTop = props.list ? '0.5rem' : '0.1rem';

    const list = props.list || [];

    useEffect(() => {
        const savedRegions = sessionStorage.getItem('regionsWithCompanies');
        if (savedRegions) {
            setRegionsWithCompanies(JSON.parse(savedRegions));
        }
    }, []);

    const handleChange = (event) => {
        const { target: { value } } = event;
        let newValue
        if(props.multiple) {
         newValue = typeof value === 'string' ? value.split(',') : value;
        } else {
             newValue = value;
        }
        props.onChange(newValue); // Pass the new value to parent
    };

    return (
        <div className={styles.formGroup}>
            
            <FormControl sx={{
                border: 'none',
            }}>
                <InputLabel
                    id="demo-multiple-checkbox-label"
                    sx={{
                        position: 'absolute',
                        width: 'fit-content',
                        left: '0.7rem',
                        top: '0.1rem',
                        fontSize: '1rem',
                        color: 'white',
                        transition: 'all 0.2s ease',
                        pointerEvents: 'none',
                        transformOrigin: 'left center',
                        zIndex: '1',
                        background: 'transparent',
                        padding: '0 0.2rem',
                        display: 'flex',
                        '&.Mui-focused, &.MuiInputLabel-shrink': {
                            width: 'fit-content',
                            top: focusedTop,
                            left: '0.5rem',
                            color: '#729fcf',
                            fontSize: '0.9rem',
                            backgroundImage: 'url("../../icons/background.jpg")',
                            backgroundSize: 'cover',
                            backgroundColor: '#141414',
                            backgroundRepeat: 'repeat',
                            backgroundPosition: 'center',
                            padding: '0 0.5rem',
                            zIndex: '10',
                        },
                    }}
                >
                  {props.label}
                </InputLabel>
                {props.list ? (
                <Select
                    sx={{
                        m: 1,
                        height: '3rem',
                        width: 'calc(100% - 2rem)',
                        marginLeft: '1rem',
                        marginRight: '1rem',
                        padding: '0.1rem',
                        borderRadius: '4px',
                        backgroundColor: 'transparent',
                        color: 'var(--textColor)',
                        fontSize: '1rem',
                        transition: 'border-color 0.2s ease',
                        boxSizing: 'border-box',
                        zIndex: '1',
                        '& .MuiSelect-icon': {
                            color: 'var(--textColor)',
                            right: '0.1rem',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            border: '1px solid #729fcf',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            border: '2px solid #729fcf',
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                            border: '1px solid #ffffff',
                            borderRadius: '4px',
                            outline: 'none',
                            zIndex: '0',
                        },
                    }}
                    labelId="demo-multiple-checkbox-label"
                    id="demo-multiple-checkbox"
                    multiple={props.multiple}
                    value={props.value} // Use value from props
                    onChange={handleChange}
                    input={<OutlinedInput  />}
                    renderValue={(selected) => typeof selected === 'string' ? selected : selected.join(', ')}
                    MenuProps={MenuProps}
                >
                    {list.map((name) => (
                        <MenuItem key={name} value={name}>
                            {props.multiple && (<Checkbox checked={props.value.includes(name)} />)}
                            <ListItemText primary={name} />
                        </MenuItem>
                    ))}
                </Select>) : (
                    <OutlinedInput
                        sx={{
                            m: 1,
                            height: '3rem',
                            width: 'calc(100% - 2rem)',
                            marginLeft: '1rem',
                            marginRight: '1rem',
                            padding: '0.1rem',
                            borderRadius: '4px',
                            backgroundColor: 'transparent',
                            color: 'var(--textColor)',
                            fontSize: '1rem',
                            transition: 'border-color 0.2s ease',
                            boxSizing: 'border-box',
                            zIndex: '1',
                             '& .MuiSelect-icon': {
                            color: 'var(--textColor)',
                            // right: '0.1rem',
                        },
                        'legend': {
                            display: 'none',
                            top: '10px',
                           
                        },
                        'span':{
                            top: '10px',
                            padding: '0'
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            border: '1px solid #729fcf',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            border: '2px solid #729fcf',
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                            border: '1px solid #ffffff',
                            borderRadius: '4px',
                            outline: 'none',
                            zIndex: '0',
                        },
                        }}
                        type='text'
                        id="outlined-basic"
                        label={props.label}
                        variant="outlined"
                        value={props.value || ""} // Use value from props
                        onChange={handleChange}
                    />
                )}  
            </FormControl>
        </div>
    );
}

export default BasicSelect;