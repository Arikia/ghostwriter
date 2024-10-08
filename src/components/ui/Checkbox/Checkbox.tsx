import React from "react";

import styles from "./styles.module.css";

type CheckBoxWithTermsProps = {
  term: string;
  isChecked: boolean;
  onChange: (isChecked: boolean) => void;
};

export const CheckboxWithTerms = ({
  term,
  isChecked,
  onChange,
}: CheckBoxWithTermsProps) => {
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.checked);
  };

  return (
    <div className={styles.root}>
      <label>
        <input
          type="checkbox"
          checked={isChecked}
          onChange={handleCheckboxChange}
          className={styles.checkbox}
        />
        {term}
      </label>
    </div>
  );
};
