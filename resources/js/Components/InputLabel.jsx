export default function InputLabel({
    value,
    className = '',
    children,
    ...props
}) {
    return (
        <label
            {...props}
            className={
                `block font-label-caps text-label-caps text-[#6D4C41] ` +
                className
            }
        >
            {value ? value : children}
        </label>
    );
}
