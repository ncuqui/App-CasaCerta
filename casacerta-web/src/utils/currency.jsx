export function toRawNumber(masked) {
    if (!masked) return '';
    const digits = masked.replace(/\D/g, '');
    return digits ? String(parseInt(digits, 10)) : '';
}

export function toMasked(raw) {
    if (!raw) return '';
    return parseInt(raw, 10).toLocaleString('pt-BR');
}

export function MoneyInput({ name, value, onChange, placeholder, disabled, className }) {
    const handleChange = (e) => {
        const raw = toRawNumber(e.target.value);
        onChange({ target: { name, value: raw } });
    };
    return (
        <input
            name={name}
            type="text"
            inputMode="numeric"
            value={toMasked(value)}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            className={className}
        />
    );
}
