(function () {
	let type = window.__validatorArgs?.[0] || '';
	let input = window.__validatorArgs?.[1] || '';
	let autoCheck = window.__validatorArgs?.[2] || false;
	try { delete window.__validatorArgs; } catch (e) {}

	// Validation functions
	function validateHKID(v) {
		if (!/^[A-Z][0-9]{6}[0-9A]$/.test(v)) return false;
		const w = [9, 8, 7, 6, 5, 4, 3];
		let sum = (v.charCodeAt(0) - 64) * w[0];
		for (let i = 1; i <= 6; i++) sum += Number(v[i]) * w[i];
		const c = (11 - (sum % 11)) % 11;
		const check = c === 10 ? 'A' : String(c);
		return check === v[7];
	}

	function computeHKIDCheck(prefix7) {
		// prefix7 expected like 'A123456' (letter + 6 digits)
		if (!/^[A-Z][0-9]{6}$/.test(prefix7)) return null;
		const w = [9, 8, 7, 6, 5, 4, 3];
		let sum = (prefix7.charCodeAt(0) - 64) * w[0];
		for (let i = 1; i <= 6; i++) sum += Number(prefix7[i]) * w[i];
		const c = (11 - (sum % 11)) % 11;
		return c === 10 ? 'A' : String(c);
	}

	function emphasizeDigitsHTML(s) {
		if (!s) return '';
		return String(s).replace(/(\d+)/g, '<span style="font-weight:700; font-size:1.4em;">$1</span>');
	}

	function emphasizeDigitsHTMLUnderlined(s) {
		if (!s) return '';
		return String(s).replace(/(\d+)/g, '<span style="font-weight:700; font-size:1.4em; text-decoration: underline;">$1</span>');
	}

	function validateTWID(v) {
		if (!/^[A-Z][12][0-9]{8}$/.test(v)) return false;
		const map = 'ABCDEFGHJKLMNPQRSTUVXYWZIO';
		const i = map.indexOf(v[0]) + 10;
		const nums = [Math.floor(i / 10), i % 10, ...v.slice(1).split('').map(Number)];
		const w = [1, 9, 8, 7, 6, 5, 4, 3, 2, 1, 1];
		const sum = nums.reduce((s, n, idx) => s + n * w[idx], 0);
		return sum % 10 === 0;
	}

	function setResult(status, title, message) {
		// MRZ and HKID: emphasize digits and underline, white background
		if (type === 'mrz' || type === 'hkid') {
			const content = message || title || '';
			// Don't emphasize digits in error messages containing "need"
			if (/need\s+\d+/i.test(content)) {
				resultDiv.textContent = content;
			} else {
				resultDiv.innerHTML = emphasizeDigitsHTMLUnderlined(content);
			}
			resultDiv.style.background = 'white';
			resultDiv.style.color = 'black';
			return;
		}

		// TWID: emphasize digits (larger & bold, no underline)
		if (type === 'twid') {
			const content = message || title || '';
			// If message contains pattern like "expect A123456789", do not emphasize digits
			if (/expect\s+A\d+/i.test(content)) {
				resultDiv.textContent = content;
			} else {
				resultDiv.innerHTML = emphasizeDigitsHTML(content);
			}
			if (status === 'calc') {
				resultDiv.style.background = 'white';
				resultDiv.style.color = 'black';
			} else if (status === 'valid') {
				resultDiv.style.background = '#d4fc79';
				resultDiv.style.color = 'black';
			} else if (status === 'invalid') {
				resultDiv.style.background = '#fecaca';
				resultDiv.style.color = 'black';
			} else {
				resultDiv.style.background = '#f7fafc';
				resultDiv.style.color = 'black';
			}
			return;
		}

		// Default behavior
		resultDiv.innerHTML = `<strong>${title}</strong><br><small>${message}</small>`;
		if (status === 'valid') {
			resultDiv.style.background = '#d4fc79';
		} else if (status === 'invalid') {
			resultDiv.style.background = '#fecaca';
		} else if (status === 'calc') {
			resultDiv.style.background = '#bfdbfe';
		} else {
			resultDiv.style.background = '#f7fafc';
		}
	}

	function checkPassport() {
		const raw = inputField.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
		const length = raw.length;
		
		if (length < 1) {
			setResult('waiting', 'Enter Passport Number', '');
			return;
		}
		
		if (length !== 9) {
			setResult('invalid', 'Invalid: must be 9 characters', '');
			return;
		}
		
		const weights = [7, 3, 1];
		let sum = 0;
		
		// Calculate check digit
		for (let i = 0; i < 9; i++) {
			const char = raw.charAt(i);
			let value;
			
			if (char >= '0' && char <= '9') {
				value = parseInt(char, 10);
			} else if (char >= 'A' && char <= 'Z') {
				value = char.charCodeAt(0) - 55; // A=10, B=11, ..., Z=35
			} else {
				setResult('invalid', 'Invalid character', '');
				return;
			}
			
			sum += value * weights[i % 3];
		}
		
		const checkDigit = (sum % 10).toString();
		setResult('calc', 'Check Digit', `Check Digit:\t${checkDigit}`);
	}

	// Create popup window
	const popup = document.createElement('div');
	popup.id = '__validator_popup';
	popup.style.cssText = `
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: white;
		border-radius: 12px;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
		padding: 30px;
		width: 90%;
		max-width: 400px;
		z-index: 999999;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
	`;

	const backdrop = document.createElement('div');
	backdrop.style.cssText = `
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 999998;
	`;

	const title = document.createElement('h2');
	title.style.cssText = 'margin-bottom: 20px; color: #2d3748; font-size: 20px; text-align: center;';

	const inputLabel = document.createElement('label');
	inputLabel.textContent = 'Enter or paste ' + (type === 'hkid' ? 'HKID' : type === 'twid' ? 'TW ID' : 'MRZ') + ':';
	inputLabel.style.cssText = 'display: block; color: #4a5568; font-weight: 600; margin-bottom: 10px; font-size: 14px;';

	const inputField = document.createElement('input');
	inputField.type = 'text';
	inputField.value = input.toUpperCase().replace(/\s+/g, '');
	inputField.placeholder = 'Paste or type ' + (type === 'hkid' ? 'HKID' : type === 'twid' ? 'TW ID' : 'MRZ');
	const inputStyle = type === 'mrz' ? 'color: black;' : '';
	inputField.style.cssText = `
		width: 100%;
		padding: 12px;
		border: 2px solid #e2e8f0;
		border-radius: 8px;
		font-size: 16px;
		margin-bottom: 15px;
		box-sizing: border-box;
		text-transform: uppercase;
		${inputStyle}
	`;

	const resultDiv = document.createElement('div');
	resultDiv.style.cssText = `
		padding: 15px;
		border-radius: 8px;
		margin-bottom: 20px;
		text-align: center;
		font-weight: 500;
		min-height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		white-space: pre;
	`;
	resultDiv.textContent = 'Ready to validate';
	resultDiv.style.background = '#f7fafc';

	const buttonContainer = document.createElement('div');
	buttonContainer.style.cssText = 'display: flex; gap: 10px;';

	const checkBtn = document.createElement('button');
	checkBtn.textContent = 'Check';
	checkBtn.style.cssText = `
		flex: 1;
		padding: 12px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		font-weight: 600;
		transition: transform 0.2s;
	`;

	const closeBtn = document.createElement('button');
	closeBtn.textContent = 'Close';
	closeBtn.style.cssText = `
		flex: 1;
		padding: 12px;
		background: #f7fafc;
		color: #4a5568;
		border: 2px solid #e2e8f0;
		border-radius: 8px;
		cursor: pointer;
		font-weight: 600;
		transition: transform 0.2s;
	`;

	function validate() {
		const val = inputField.value.toUpperCase().replace(/\s+/g, '');
		if (!val) {
			resultDiv.textContent = 'Please enter a value';
			resultDiv.style.background = '#fecaca';
			return;
		}

		let isValid = false;
		if (type === 'hkid') {
			// Auto-check mode: generate check digit from first 7 chars
			if (autoCheck) {
				const prefix = val.replace(/[^A-Z0-9]/g, '').slice(0, 7);
				if (prefix.length < 7) {
					setResult('invalid', 'Invalid: need 7 chars', '');
					return;
				}
				const check = computeHKIDCheck(prefix);
				if (check === null) {
					setResult('invalid', 'Invalid: format', '');
				} else {
					setResult('calc', 'Check Digit', `Check Digit:\t${check}`);
				}
				return;
			}
			// Manual mode: full validation
			if (!/^[A-Z][0-9]{6}[0-9A]$/.test(val)) {
				setResult('invalid', '❌ Invalid format (expect A1234567X)', '');
			} else {
				isValid = validateHKID(val);
				if (isValid) {
				setResult('valid', '✅ VALID HK ID', `HK ID:\t${val}`);
			} else {
				setResult('invalid', '❌ INVALID HK ID', `HK ID:\t${val}`);
				}
			}
		} else if (type === 'twid') {
			if (!/^[A-Z][12][0-9]{8}$/.test(val)) {
				setResult('invalid', '❌ Invalid format (expect A123456789)', '');
			} else {
				isValid = validateTWID(val);
				if (isValid) {
					setResult('valid', '✅ VALID TW ID');
				} else {
					setResult('invalid', '❌ INVALID TW ID');
				}
			}
		} else if (type === 'mrz') {
			checkPassport();
		}
	}

	checkBtn.addEventListener('click', validate);
	inputField.addEventListener('keydown', (e) => {
		if (e.key === 'Enter') validate();
		if (e.key === 'Escape') close();
	});

	closeBtn.addEventListener('click', () => {
		popup.remove();
		backdrop.remove();
	});

	function close() {
		popup.remove();
		backdrop.remove();
	}

	checkBtn.addEventListener('mousedown', function() { this.style.transform = 'translateY(-2px)'; });
	checkBtn.addEventListener('mouseup', function() { this.style.transform = ''; });
	closeBtn.addEventListener('mousedown', function() { this.style.transform = 'translateY(-2px)'; });
	closeBtn.addEventListener('mouseup', function() { this.style.transform = ''; });

	// Set title based on type
	if (type === 'hkid') {
		title.textContent = autoCheck ? 'HK ID Check Digit Calculator' : 'HK ID Validator';
	} else if (type === 'twid') {
		title.textContent = 'Taiwan ID Validator';
	} else if (type === 'mrz') {
		title.textContent = 'Passport Check Digit Calculator';
	} else {
		title.textContent = 'ID Validator';
	}

	// Assemble popup
	popup.appendChild(title);
	popup.appendChild(inputLabel);
	popup.appendChild(inputField);
	popup.appendChild(resultDiv);
	buttonContainer.appendChild(checkBtn);
	buttonContainer.appendChild(closeBtn);
	popup.appendChild(buttonContainer);

	// Add to page
	document.body.appendChild(backdrop);
	document.body.appendChild(popup);

	// Focus input and auto-validate if input provided
	inputField.focus();
	if (input) {
		validate();
	}
})();