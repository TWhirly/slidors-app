import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import debounce from 'lodash/debounce';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';

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
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const searchInputRef = useRef(null);

    // Используем props.list как основной источник данных
    const [localList, setLocalList] = useState(props.list || []);

    // Синхронизируем localList при изменении props.list
    useEffect(() => {
        setLocalList(props.list || []);
    }, [props.list]);

    // Create a memoized debounced function
    const debouncedSearch = useMemo(
        () => debounce((searchTerm) => {
            setDebouncedSearchTerm(searchTerm);
        }, 300),
        []
    );

    // Use debounced search term in filteredList
    const filteredList = useMemo(() => {
        if (!props.searchable) return localList;
        if (!debouncedSearchTerm) return localList;

        return localList.filter(item =>
            item.toString().toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        );
    }, [localList, debouncedSearchTerm, props.searchable]);

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

    const handleClearAll = (event) => {
        setDebouncedSearchTerm('');
        setSearch('');
        event.stopPropagation();
        props.onChange(props.multiple ? [] : '');
    };

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setDebouncedSearchTerm('');
        setSearch('');
        setIsFocused(false);
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearch(value);
        debouncedSearch(value);
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    };

    // Cleanup debounce on unmount
    useEffect(() => {
        return () => {
            debouncedSearch.cancel();
        };
    }, [debouncedSearch]);

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
                    endAdornment={
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            {props.multiple && props.value?.length > 0 && (
                                <IconButton
                                    size="small"
                                    onClick={handleClearAll}
                                    sx={{
                                        color: 'white',
                                        padding: '4px',
                                        marginRight: '10px',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        }
                                    }}
                                >
                                    <ClearIcon fontSize="small" />
                                </IconButton>
                            )}
                        </div>
                    }
                >
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setSearch('');
                            setDebouncedSearchTerm('');
                            if (searchInputRef.current) {
                                searchInputRef.current.focus();
                            }
                        }}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            padding: '4px 4px',
                            marginRight: '54px',
                            fontSize: '1.2rem',
                            lineHeight: 1,
                        }}
                        type="button"
                    >
                        ×
                    </button>

                    {props.searchable && (
                        <div
                        onClose={handleBlur}
                        style={{
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
                                endAdornment={
                                    search && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSearch('');
                                                setDebouncedSearchTerm('');
                                                if (searchInputRef.current) {
                                                    searchInputRef.current.focus();
                                                }
                                            }}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: '#444',
                                                cursor: 'pointer',
                                                padding: '4px 4px',
                                                marginRight: '4px',
                                                fontSize: '1.2rem',
                                                lineHeight: 1,
                                            }}
                                            type="button"
                                        >
                                            ×
                                        </button>
                                    )
                                }
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
                                
                            />
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