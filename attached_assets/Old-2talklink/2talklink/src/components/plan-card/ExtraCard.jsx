import styles from "./extra-card.module.css";

export default function ExtraCard({ onSelect, customFields = [] }) {
  const optionMap = new Map(
    customFields.map((option) => [option.vcard_number, option])
  );

  const handleSelectChange = (e) => {
    const selectedValue = e.target.value;
    
    if (selectedValue) {
      const selectedOption = optionMap.get(parseInt(selectedValue));
      onSelect(selectedOption);
    } else {
      onSelect(null);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.selectWrapper}>
        <select
          className={styles.select}
          defaultValue=""
          onChange={handleSelectChange}
        >
          <option value="">How Many</option>
          {customFields?.map((option) => (
            <option key={option.vcard_number} value={option.vcard_number}>
              {option.vcard_number} cards for ${option.vcard_price}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
