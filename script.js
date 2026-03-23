document.addEventListener('DOMContentLoaded', () => {
    const actionBtn = document.getElementById('action-btn');
    const statusMessage = document.getElementById('status-message');

    actionBtn.addEventListener('click', () => {
        // Change button state
        actionBtn.textContent = 'Processing...';
        actionBtn.style.opacity = '0.8';
        actionBtn.disabled = true;

        // Simulate network request to Firebase
        setTimeout(() => {
            statusMessage.textContent = '✅ Successfully connected to Firebase & Updated Database!';
            statusMessage.classList.remove('hidden');
            statusMessage.classList.add('visible');

            // Reset button
            actionBtn.textContent = 'Data Synced ⚡';
            actionBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
            
            // Add a little celebratory animation
            actionBtn.style.transform = 'scale(1.1)';
            setTimeout(() => {
                actionBtn.style.transform = 'scale(1)';
            }, 200);

        }, 1500);
    });
});