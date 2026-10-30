/**
 * Frontend Mentor - Tip Calculator App (Splitter)
 * Vanilla JavaScript Implementation
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const billInput = document.getElementById('bill');
  const peopleInput = document.getElementById('people');
  const customTipInput = document.getElementById('custom-tip');
  const tipButtons = document.querySelectorAll('.tip-button');
  const tipAmountDisplay = document.getElementById('tip-amount');
  const totalAmountDisplay = document.getElementById('total-amount');
  const resetButton = document.getElementById('reset-btn');
  const peopleGroup = document.getElementById('people-group');

  let currentTipPercent = 0;

  // Calculation Function
  function calculate() {
    const bill = parseFloat(billInput.value) || 0;
    const peopleStr = peopleInput.value.trim();
    const people = parseInt(peopleStr, 10);

    // Validate people
    if (peopleStr !== '' && people === 0) {
      peopleGroup.classList.add('has-error');
      tipAmountDisplay.textContent = '$0.00';
      totalAmountDisplay.textContent = '$0.00';
      updateResetButtonState();
      return;
    } else {
      peopleGroup.classList.remove('has-error');
    }

    if (bill > 0 && people > 0 && currentTipPercent >= 0) {
      const totalTip = bill * (currentTipPercent / 100);
      const tipPerPerson = totalTip / people;
      const totalPerPerson = (bill + totalTip) / people;

      tipAmountDisplay.textContent = `$${tipPerPerson.toFixed(2)}`;
      totalAmountDisplay.textContent = `$${totalPerPerson.toFixed(2)}`;
    } else {
      tipAmountDisplay.textContent = '$0.00';
      totalAmountDisplay.textContent = '$0.00';
    }

    updateResetButtonState();
  }

  // Update Reset Button Disabled state
  function updateResetButtonState() {
    const hasValues =
      (billInput.value && parseFloat(billInput.value) > 0) ||
      (peopleInput.value && peopleInput.value !== '') ||
      currentTipPercent > 0;

    resetButton.disabled = !hasValues;
  }

  // Handle Tip Button Clicks
  tipButtons.forEach((button) => {
    button.addEventListener('click', () => {
      tipButtons.forEach((b) => b.classList.remove('active'));
      button.classList.add('active');
      customTipInput.value = '';
      currentTipPercent = parseFloat(button.dataset.tip);
      calculate();
    });
  });

  // Handle Custom Tip Input
  customTipInput.addEventListener('input', () => {
    tipButtons.forEach((b) => b.classList.remove('active'));
    const val = parseFloat(customTipInput.value);
    currentTipPercent = !isNaN(val) && val >= 0 ? val : 0;
    calculate();
  });

  // Handle Bill & People Input Events
  billInput.addEventListener('input', calculate);
  peopleInput.addEventListener('input', calculate);

  // Handle Reset Button
  resetButton.addEventListener('click', () => {
    billInput.value = '';
    peopleInput.value = '';
    customTipInput.value = '';
    tipButtons.forEach((b) => b.classList.remove('active'));
    peopleGroup.classList.remove('has-error');
    currentTipPercent = 0;
    tipAmountDisplay.textContent = '$0.00';
    totalAmountDisplay.textContent = '$0.00';
    resetButton.disabled = true;
  });

  // Initial Calculation
  calculate();
});
