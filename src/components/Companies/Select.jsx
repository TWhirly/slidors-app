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

const BasicSelect = (label) => {
    const { regions: contextRegions } = useContext(DataContext);
    const [regionsWithCompanies, setRegionsWithCompanies] = useState([]);

    const loadedRecyclers = [
        'Oliver Hansen',
        'Van Henry',
        'April Tucker',
        'Ralph Hubbard',
        'Omar Alexander',
        'Carlos Abbott',
        'Miriam Wagner',
        'Bradley Wilkerson',
        'Virginia Andrews',
        'Kelly Snyder',
    ];

    useEffect(() => {
        const savedRegions = sessionStorage.getItem('regionsWithCompanies');
        if (savedRegions) {
            setRegionsWithCompanies(JSON.parse(savedRegions));
        }
    }, []);

    const [recyclers, setRecyclers] = useState([]);

    const handleChange = (event) => {
        const { target: { value } } = event;
        setRecyclers(typeof value === 'string' ? value.split(',') : value);
    };

    return (
        <div className={styles.formGroup}>
            <FormControl sx={{
        border: 'none',
        '& .MuiInputLabel-shrink': { // Изменено здесь
            border: 'none',
            outline: 'none',
            zIndex: '1',
            '&::before': {
                content: '""',
                position: 'absolute',
                left: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                width: '100%',
                height: '2px',
                backgroundColor: 'var(--backgroundColor, #1e1e1e)',
                zIndex: '-1',
                border: 'none'
            }
        }
    }}>
                <InputLabel
                    id="demo-multiple-checkbox-label"
                    sx={{
                        position: 'absolute',
                        left: '1rem',
                        top: '0.3rem',
                        fontSize: '1rem',
                        color: '#729fcf',
                        transition: 'all 0.2s ease',
                        pointerEvents: 'none',
                        padding: '0 0.5rem',
                        transformOrigin: 'left center',
                        zIndex: '1',
                        border: 'none',
                        outline: 'none',
                        '&.Mui-focused, &.MuiInputLabel-shrink': {
                            top: '-0.5rem',
                            left: '0.5rem',
                            color: '#729fcf',
                            fontSize: '0.9rem',
                            backgroundColor: 'transparent',
                            padding: '0 0.5rem',
                            zIndex: '10',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                left: 0,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: '100%',
                                height: '2px',
                                backgroundColor: 'transparent',
                                zIndex: '-1'
                            }
                        }
                    }}
                >
                    Tag
                </InputLabel>
                <Select
                    sx={{
                        m: 1,
                        height: '3rem',
                        width: 'calc(100% - 2rem)',
                        marginLeft: '1rem',
                        marginRight: '1rem',
                        padding: '0.1rem',
                        border: '1px solid #ffffff',
                        borderRadius: '4px',
                        backgroundColor: 'transparent',
                        color: 'var(--textColor)',
                        fontSize: '1rem',
                        transition: 'border-color 0.2s ease',
                        boxSizing: 'border-box',
                        zIndex: '1',
                        '& .MuiSelect-icon': {
                            color: 'var(--textColor)',
                            right: '1rem',
                        },
                        '&:hover': {
                            borderColor: '#729fcf',
                        },
                        '&.Mui-focused': {
                            border: 'none',
                            borderColor: '#729fcf',
                            outline: 'none',
                        },
                        '&.MuiInputLabel-shrink': {
                            border: 'none',
                            outline: 'none',
                        },
                        '&.MuiInputBase-root:has(input:not([value=""]))': {
            // Стили поля, когда есть данные
            '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#729fcf',
                borderWidth: '1px',
            }
        },
                        '& .MuiOutlinedInput-notchedOutline': {
                            border: '1px solid #ffffff',
                            borderRadius: '4px',
                            outline: 'none',
                        },
                    }}
                    labelId="demo-multiple-checkbox-label"
                    id="demo-multiple-checkbox"
                    multiple
                    value={recyclers}
                    onChange={handleChange}
                    input={<OutlinedInput 
                        label="Tag"
                        sx={{
                            backgroundColor: 'transparent',
                            color: 'var(--textColor)',
                            fontSize: '1rem',
                            transition: 'border-color 0.2s ease',
                            boxSizing: 'border-box',
                        }}
                    />}
                    renderValue={(selected) => selected.join(', ')}
                    MenuProps={MenuProps}
                >
                    {loadedRecyclers.map((name) => (
                        <MenuItem key={name} value={name}>
                            <Checkbox checked={recyclers.includes(name)} />
                            <ListItemText primary={name} />
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </div>
    );
}

export default BasicSelect;