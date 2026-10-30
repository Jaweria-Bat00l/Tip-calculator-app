/**
 * Frontend Mentor - Advice Generator App
 * Vanilla JavaScript Implementation using Advice Slip API
 */

document.addEventListener('DOMContentLoaded', () => {
  const adviceIdEl = document.getElementById('advice-id');
  const adviceQuoteEl = document.getElementById('advice-quote');
  const diceBtn = document.getElementById('dice-btn');

  let isFetching = false;

  // Fallback quotes in case of network restrictions or API outage
  const FALLBACK_ADVICE = [
    { id: 117, advice: "It is easy to sit up and take notice, what's difficult is getting up and taking action." },
    { id: 71, advice: "It is not the mountain we conquer, but ourselves." },
    { id: 142, advice: "Always do what you are afraid to do." },
    { id: 198, advice: "When in doubt, just take the next small step." },
    { id: 224, advice: "Remind yourself that good things take time." }
  ];

  async function fetchAdvice() {
    if (isFetching) return;
    isFetching = true;

    diceBtn.classList.add('spinning');
    adviceQuoteEl.classList.add('fade-out');

    try {
      // Adding timestamp to bypass aggressive HTTP caching by Advice Slip API
      const response = await fetch(`https://api.adviceslip.com/advice?t=${Date.now()}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      const { id, advice } = data.slip;

      adviceIdEl.textContent = `ADVICE #${id}`;
      adviceQuoteEl.textContent = `“${advice}”`;
    } catch (err) {
      console.warn('API error, using curated fallback advice:', err);
      const fallback = FALLBACK_ADVICE[Math.floor(Math.random() * FALLBACK_ADVICE.length)];
      adviceIdEl.textContent = `ADVICE #${fallback.id}`;
      adviceQuoteEl.textContent = `“${fallback.advice}”`;
    } finally {
      diceBtn.classList.remove('spinning');
      adviceQuoteEl.classList.remove('fade-out');
      // Cooldown to prevent spamming the rate-limited API
      setTimeout(() => {
        isFetching = false;
      }, 500);
    }
  }

  // Click handler
  diceBtn.addEventListener('click', fetchAdvice);

  // Keyboard accessibility: press Spacebar or Enter when focused
  diceBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fetchAdvice();
    }
  });

  // Fetch initial advice on load if still placeholder
  if (adviceIdEl.textContent.includes('<!--')) {
    fetchAdvice();
  }
});
