import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import styles from './CompanyEditForm.module.css';

export default function BasicSelect() {
    const [age, setAge] = React.useState('');

    const handleChange = (event) => {
        setAge(event.target.value);
    };

    return (
        <Box

            sx={{



            }}>
            <FormControl
                fullWidth>
                <InputLabel
                    id="demo-simple-select-label"
                    sx={{
                        position: 'absolute',
                        left: '0.7rem',
                        top: '0',
                        marginTop: 'auto',
                        marginBottom: 'auto',
                        justifyItems: 'center',
                        fontSize: '0.8rem',
                        color: '#729fcf',
                        transition: 'all 0.2s ease',
                        pointerEvents: 'none',
                        backgroundColor: 'transparent',
                        padding: '0 0.2rem',
                        transformOrigin: 'left center'

                    }}
                >Age

                </InputLabel>
                <Select
                    sx={{
                        height: '3rem',
                        minWidth: 120,
                        width: 'calc(100% - 2rem)',
                        marginLeft: '1rem',
                        marginRight: '1rem',
                        padding: '0.8rem',
                        border: '1px solid #ffffff',
                        borderRadius: '4px',
                        backgroundColor: 'transparent',
                        color: 'var(--textColor)',
                        fontSize: '1rem',
                        transition: 'border-color 0.2s ease',
                        boxSizing: 'border-box'
                    }}
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={age}
                    label="Age"
                    onChange={handleChange}
                >
                    <MenuItem value={10}>Ten</MenuItem>
                    <MenuItem value={20}>Twenty</MenuItem>
                    <MenuItem value={30}>Thirty</MenuItem>
                </Select>
            </FormControl>
        </Box>
    );
}
