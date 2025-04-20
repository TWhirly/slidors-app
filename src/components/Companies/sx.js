export const avatar = (name) => {

    return({
      
    height: "1.7rem",
    width: "1.7rem",
    bgcolor: name ? stringToColor(name) : ''
    }
    )
}

export const avatarGroup = () => {
    return({
        display: "flex",
    alignSelf: "right",
    height: "1.7rem",
    // alignItems: "center",
    // width: "fit-content",
    marginTop: "2px",
    marginRight: "3px"
    }
    )
}

function stringToColor(string) {
    let hash = 0;
    let i;
  
    /* eslint-disable no-bitwise */
    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
  
    let color = '#';
  
    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    /* eslint-enable no-bitwise */
  
    return color;
  }