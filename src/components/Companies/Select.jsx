import { useState, useMemo, useRef, useEffect } from 'react';
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

    // Используем props.list как основной источник данных
    const [localList, setLocalList] = useState(props.list || []);

    // Синхронизируем localList при изменении props.list
    useEffect(() => {
        setLocalList(props.list || []);
    }, [props.list]);

    const filteredList = useMemo(() => {
        if (!props.searchable) return localList;
        if (!search) return localList;

        return localList.filter(item =>
            item.toString().toLowerCase().includes(search.toLowerCase())
        );
    }, [localList, search, props.searchable]);

    const handleClick = () => {
        if (search && !localList.includes(search)) {
            const newList = [...localList, search];
            setLocalList(newList);

            // Обновляем значение в formData
            if (props.multiple) {
                const newValue = props.value ? [...props.value, search] : [search];
                props.onChange(newValue);
            } else {
                props.onChange(search);
            }
            setSearch('');
        }
    };

    const handleChange = (event) => {
        console.log('event', event)
        const { target: { value } } = event;
        if (value !== undefined) {
            setSearch('');
            let newValue;
            if (props.multiple) {
                newValue = typeof value === 'string' ? value.split(',') : value;
            } else {
                newValue = value;
            }
            console.log('search2', search)
            props.onChange(newValue);
        }
    };

    // const handleClick = () => {
    //     if (search && !localList.includes(search)) {
    //         const newList = [...localList, search];
    //         setLocalList(newList);

    //         // Immediately set the new value
    //         if (props.multiple) {
    //             const newValue = props.value ? [...props.value, search] : [search];
    //             props.onChange(newValue);
    //         } else {
    //             console.log('search', search)
    //             props.onChange(search);
    //         }
    //         setSearch('');
    //     }
    // };

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
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
                    top: !!props.value || isFocused ? '0.1rem' : '0.7rem',
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
                        disableAutoFocus: true,
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
                            borderBottom: '1px solid #444',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
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
                                onKeyDown={(e) => e.stopPropagation()}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button 
                                className="close-button"
                                onClick={() => {
                                    setSearch('');
                                    if (searchInputRef.current) {
                                        searchInputRef.current.focus();
                                    }
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#444',
                                    cursor: 'pointer',
                                    position: 'absolute',
                                    right: '8px',
                                    top: '50%',
                                    transform: 'translateY(-50%)'
                                }}
                                type="button">
                                    Close
                                    <span aria-hidden="true">×</span>
                                </button>
                            </OutlinedInput>
                            {search && props.allowAdds && !filteredList.includes(search) && (
                                <button
                                    onClick={handleClick}
                                    style={{
                                        background: '#729fcf',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        padding: '8px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}
                                >
                                    Добавить "{search}"
                                </button>
                            )}
                        </div>
                    )}
                    {filteredList.length > 0 ? (
                        filteredList.map((name) => (
                            <MenuItem
                                key={name}
                                value={name}
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