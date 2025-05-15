import * as React from 'react';
import { useState, useMemo, useRef } from 'react';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';

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
    const [search, setSearch] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const searchInputRef = useRef(null);
    const list = useMemo(() => props.list || [], [props.list]);

    const filteredList = useMemo(() => {
        if (!props.searchable) return list;
        if (!search) return list;

        return list.filter(item =>
            item.toString().toLowerCase().includes(search.toLowerCase())
        );
    }, [list, search, props.searchable]);

    const handleChange = (event) => {
        const { target: { value } } = event;
        let newValue;
        if (props.multiple) {
            newValue = typeof value === 'string' ? value.split(',') : value;
        } else {
            newValue = value;
        }
        props.onChange(newValue);
    };

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        // Сохраняем фокус на поле ввода
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    };

    return (
        <FormControl fullWidth>
            <InputLabel
                id={`${props.name}-label`}
                shrink={!!props.value || isFocused}
                sx={{
                    position: 'absolute',
                    left: '1rem',
                    top: !!props.value || isFocused ? '0' : '1rem',
                    transform: !!props.value || isFocused ? 'translateY(-50%) scale(0.9)' : 'none',
                    color: 'white',
                    fontSize: !!props.value || isFocused ? '0.9rem' : '1rem',
                    transition: 'all 0.2s ease',
                    '&.Mui-focused': {
                        color: '#729fcf',
                    },
                    backgroundColor: !!props.value || isFocused ? 'rgba(20, 20, 20, 0.8)' : 'transparent',
                    padding: !!props.value || isFocused ? '0 0.3rem' : '0',
                    zIndex: 1,
                }}
            >
                {props.label}
            </InputLabel>

            {props.list ? (
                <Select
                    labelId={`${props.name}-label`}
                    id={props.name}
                    multiple={props.multiple}
                    value={props.value}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    input={<OutlinedInput />}
                    renderValue={(selected) => typeof selected === 'string' ? selected : selected.join(', ')}
                    MenuProps={{
                        ...MenuProps,
                        // Отключаем автофокус при открытии
                        disableAutoFocus: true,
                        // Отключаем автофокус элементов
                        disableAutoFocusItem: true,
                    }}
                    sx={{
                        height: props.rows ? 'auto' : '3rem',
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'white',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#729fcf',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#729fcf',
                            borderWidth: '2px',
                        },
                        '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'white',
                            opacity: 0.7,
                        },
                        '& .MuiSelect-icon': {
                            color: 'white',
                        },
                        '& .MuiSelect-select': {
                            color: 'white',
                            '-webkit-text-fill-color': 'white',
                        },
                        '&.Mui-disabled .MuiSelect-select': {
                            opacity: 0.7,
                        }
                    }}
                >
                    {props.searchable && (
                        <div style={{
                            padding: '8px',
                            position: 'sticky',
                            top: 0,
                            background: 'white',
                            zIndex: 1,
                            borderBottom: '1px solid #444'
                        }}>
                            <OutlinedInput
                                inputRef={searchInputRef}
                                fullWidth
                                placeholder="Поиск..."
                                value={search}
                                onChange={handleSearchChange}
                                sx={{
                                    backgroundColor: 'white',
                                    borderRadius: '4px',
                                    '& .MuiOutlinedInput-input': {
                                        color: 'black',
                                        padding: '8px',
                                    },
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#ccc',
                                    },
                                }}
                                size="small"
                                // Отключаем всплытие событий, чтобы не терять фокус
                                onKeyDown={(e) => e.stopPropagation()}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    )}
                    {filteredList.length > 0 ? (
                        filteredList.map((name) => (
                            <MenuItem
                                key={name}
                                value={name}
                                // Отключаем автофокус для элементов меню
                                autoFocus={false}
                            >
                                {props.multiple && <Checkbox checked={props.value?.includes(name) || false} />}
                                <ListItemText primary={name} />
                            </MenuItem>
                        ))
                    ) : (
                        <MenuItem disabled>
                            <ListItemText primary="Ничего не найдено" />
                        </MenuItem>
                    )}
                </Select>
            ) : (
                <OutlinedInput
                    id={props.name}
                    type={props.type || 'text'}
                    value={props.value || ''}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    disabled={props.disabled}
                    multiline={props.rows ? true : false}
                    rows={props.rows || 1}
                    sx={{
                        color: 'white',
                        height: props.rows ? 'auto' : '3rem',
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'white',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#729fcf',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#729fcf',
                            borderWidth: '2px',
                        },
                        '&.Mui-disabled': {
                            color: 'white !important',
                            '-webkit-text-fill-color': 'white !important',
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'white !important',
                                opacity: 0.7,
                            },
                            '& .MuiOutlinedInput-input': {
                                color: 'white !important',
                                '-webkit-text-fill-color': 'white !important',
                                opacity: 0.7,
                            },
                        },
                    }}
                />
            )}
        </FormControl>
    );
};

export default BasicSelect;