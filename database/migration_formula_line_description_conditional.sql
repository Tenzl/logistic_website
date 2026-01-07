-- Add description and conditional appear fields to formula_lines
ALTER TABLE formula_lines
    ADD COLUMN description TEXT NULL AFTER label,
    ADD COLUMN conditional_var_key VARCHAR(100) NULL AFTER required_inputs,
    ADD COLUMN conditional_values TEXT NULL AFTER conditional_var_key;
