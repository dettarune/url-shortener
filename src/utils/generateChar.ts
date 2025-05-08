export const generateCharacter = (length: number): string => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    return Array.from({ length }, () => 
      characters.charAt(Math.floor(Math.random() * characters.length))
    ).join('');
  };

