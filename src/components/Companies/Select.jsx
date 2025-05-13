import * as React from 'react';
import { useContext, useState, useEffect } from 'react';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';

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
                        left: '1rem',
                        top: '0.3rem',
                        fontSize: '1rem',
                        color: '#729fcf',
                        transition: 'all 0.2s ease',
                        pointerEvents: 'none',
                        transformOrigin: 'left center',
                        zIndex: '1',
                        background: 'transparent',
                        padding: '0 0.2rem',
                        display: 'flex',
                        '&.Mui-focused, &.MuiInputLabel-shrink': {
                            width: 'fit-content',
                            top: '0.5rem',
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
                    input={<OutlinedInput label="Tag" />}
                    renderValue={(selected) => typeof selected === 'string' ? selected : selected.join(', ')}
                    MenuProps={MenuProps}
                >
                    {list.map((name) => (
                        <MenuItem key={name} value={name}>
                            {props.multiple && (<Checkbox checked={props.value.includes(name)} />)}
                            <ListItemText primary={name} />
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </div>
    );
}

export default BasicSelect;