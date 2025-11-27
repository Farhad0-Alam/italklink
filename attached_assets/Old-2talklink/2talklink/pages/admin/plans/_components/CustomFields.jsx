import { useState } from 'react'
import styles from '../_styles/CustomFields.module.css'

export default function CustomFields({ fields, onChange }) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newField, setNewField] = useState({ vcard_number: '', vcard_price: '' })

  const handleAdd = () => {
    if (newField.vcard_number && newField.vcard_price) {
      onChange([...fields, newField])
      setNewField({ vcard_number: '', vcard_price: '' })
      setShowAddForm(false)
    }
  }

  const handleRemove = (index) => {
    onChange(fields.filter((_, i) => i !== index))
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewField(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className={styles.container}>
      {!showAddForm && (
        <button type='button' onClick={() => setShowAddForm(true)} className={styles.addButton}>
          +
        </button>
      )}
      {showAddForm && (
        <div className={styles.inputGroup}>
          <input
            type="number"
            name="vcard_number"
            value={newField.vcard_number}
            onChange={handleInputChange}
            placeholder="js.custom_vcard_number"
            className={styles.input}
          />
          <input
            type="number"
            name="vcard_price"
            value={newField.vcard_price}
            onChange={handleInputChange}
            placeholder="js.custom_vcard_price"
            className={styles.input}
          />
          <button type='button' onClick={handleAdd} className={styles.addButton}>
            Add
          </button>
          <button type='button' onClick={() => setShowAddForm(false)} className={styles.cancelButton}>
            Cancel
          </button>
        </div>
      )}
      {fields.map((field, index) => (
        <div key={index} className={styles.field}>
          <span>Number: {field.vcard_number}, Price: {field.vcard_price}</span>
          <button type='button' onClick={() => handleRemove(index)} className={styles.removeButton}>
            Remove
          </button>
        </div>
      ))}
    </div>
  )
}

