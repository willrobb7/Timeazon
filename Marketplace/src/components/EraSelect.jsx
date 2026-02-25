export default function EraSelect ({eras, selected, onChange}) {

    return (
        <div>
          <p>Filter</p>
            <select className="eraDropdown" value={selected} onChange={(event) => onChange(event.target.value)}>
          <option value="">Era</option>
          {eras.map((era) => (
            <option key={era} value={era}>
            {era}
            </option>
          ))}
        </select>
        </div>
    )

}
