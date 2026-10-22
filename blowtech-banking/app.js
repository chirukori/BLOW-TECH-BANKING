const API_BASE_URL = 'http://localhost:5000/api';

const fetchApi = async (endpoint, options = {}) => {
    const token = localStorage.getItem('blowtech_token');
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'API Error');
    return data;
};

document.addEventListener('DOMContentLoaded', () => {
    // State
    let isBalanceHidden = false;
    let balanceAmount = 0;
    let availableAmount = 0;
    let currentTransactions = [];
    let currentUser = JSON.parse(localStorage.getItem('blowtech_user') || 'null');
    
    // Load Dashboard Data
    const loadDashboardData = async () => {
        if (!currentUser) return;
        try {
            const [balanceData, txData, notifData] = await Promise.all([
                fetchApi(`/account/${currentUser._id}/balance`),
                fetchApi(`/transactions/${currentUser._id}`),
                fetchApi(`/notifications/${currentUser._id}`)
            ]);
            
            balanceAmount = balanceData.balance || 0;
            availableAmount = balanceAmount;
            currentTransactions = txData || [];
            
            if (!isBalanceHidden) {
                totalBalanceEl.textContent = formatCurrency(balanceAmount);
                availableBalanceEl.textContent = formatCurrency(availableAmount);
            }
            
            renderTransactions(currentTransactions);
            if (typeof renderNotifications === 'function') renderNotifications(notifData);
        } catch (err) {
            console.error('Error loading data:', err);
        }
    };

    // DOM Elements
    const toggleBalanceBtn = document.getElementById('toggleBalanceBtn');
    const totalBalanceEl = document.getElementById('totalBalanceAmount');
    const availableBalanceEl = document.getElementById('availableBalanceAmount');
    const toggleIcon = toggleBalanceBtn.querySelector('i');
    
    const transactionsList = document.getElementById('transactionsList');
    const searchInput = document.getElementById('transactionSearch');
    const emptyState = document.getElementById('emptyState');
    const resetSearchBtn = document.getElementById('resetSearchBtn');

    // Modal Elements
    const modal = document.getElementById('sendMoneyModal');
    const openModalBtns = [document.getElementById('mobileSendBtn'), document.getElementById('desktopSendBtn'), document.getElementById('quickSendBtn')];
    const closeModalBtn = document.getElementById('closeModalBtn');
    const sendForm = document.getElementById('sendForm');
    
    const stepForm = document.getElementById('sendForm');
    const stepConfirm = document.getElementById('confirmStep');
    const stepSuccess = document.getElementById('successStep');
    
    // Form Inputs
    const recipientInput = document.getElementById('recipient');
    const amountInput = document.getElementById('amount');
    const noteInput = document.getElementById('note');
    const amountGroup = amountInput.parentElement;
    
    // Buttons inside modal
    const backToFormBtn = document.getElementById('backToFormBtn');
    const confirmSendBtn = document.getElementById('confirmSendBtn');
    const doneBtn = document.getElementById('doneBtn');

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    // Toggle Balance
    toggleBalanceBtn.addEventListener('click', () => {
        isBalanceHidden = !isBalanceHidden;
        if (isBalanceHidden) {
            totalBalanceEl.textContent = '••••••••';
            availableBalanceEl.textContent = '••••••••';
            toggleIcon.setAttribute('data-lucide', 'eye-off');
        } else {
            totalBalanceEl.textContent = formatCurrency(balanceAmount);
            availableBalanceEl.textContent = formatCurrency(availableAmount);
            toggleIcon.setAttribute('data-lucide', 'eye');
        }
        lucide.createIcons();
    });

    // Render Transactions
    const renderTransactions = (transactions) => {
        transactionsList.innerHTML = '';
        
        if (transactions.length === 0) {
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
            
            transactions.forEach(tx => {
                const row = document.createElement('div');
                row.className = 'transaction-row';
                
                const isPositive = tx.amount > 0;
                const sign = isPositive ? '+' : '';
                const amountClass = isPositive ? 'tx-amount positive' : 'tx-amount';
                
                row.innerHTML = `
                    <div class="tx-left">
                        <div class="tx-icon">
                            <i data-lucide="${tx.icon}"></i>
                        </div>
                        <div class="tx-details">
                            <span class="tx-merchant">${tx.merchant}</span>
                            <span class="tx-category">${tx.category}</span>
                        </div>
                    </div>
                    <div class="tx-right">
                        <span class="${amountClass}">${sign}${formatCurrency(Math.abs(tx.amount))}</span>
                        <span class="tx-date">${new Date(tx.date).toLocaleDateString()}</span>
                    </div>
                `;
                transactionsList.appendChild(row);
            });
            lucide.createIcons();
        }
    };

    // Search functionality
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = currentTransactions.filter(tx => 
            tx.merchant.toLowerCase().includes(term) || 
            tx.category.toLowerCase().includes(term)
        );
        renderTransactions(filtered);
    });

    resetSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        renderTransactions(currentTransactions);
    });

    // Modal Logic
    const openModal = () => {
        modal.classList.remove('hidden');
        resetModal();
        recipientInput.focus();
    };

    const closeModal = () => {
        modal.classList.add('hidden');
    };

    const resetModal = () => {
        stepForm.classList.add('active');
        stepForm.classList.remove('hidden');
        stepConfirm.classList.remove('active');
        stepConfirm.classList.add('hidden');
        stepSuccess.classList.remove('active');
        stepSuccess.classList.add('hidden');
        
        stepForm.reset();
        amountGroup.classList.remove('invalid');
    };

    // Attach open modal to all send buttons
    openModalBtns.forEach(btn => {
        if(btn) btn.addEventListener('click', openModal);
    });
    
    closeModalBtn.addEventListener('click', closeModal);
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });

    // Form Submission (Step 1 -> 2)
    stepForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const amount = parseFloat(amountInput.value);
        
        if (isNaN(amount) || amount <= 0) {
            amountGroup.classList.add('invalid');
            return;
        }
        amountGroup.classList.remove('invalid');

        // Populate Confirmation Data
        document.getElementById('confirmRecipient').textContent = recipientInput.value;
        document.getElementById('confirmAmount').textContent = formatCurrency(amount);
        document.getElementById('confirmNote').textContent = noteInput.value || 'None';

        // Switch to Step 2
        stepForm.classList.remove('active');
        stepForm.classList.add('hidden');
        stepConfirm.classList.remove('hidden');
        stepConfirm.classList.add('active');
    });

    // Back button (Step 2 -> 1)
    backToFormBtn.addEventListener('click', () => {
        stepConfirm.classList.remove('active');
        stepConfirm.classList.add('hidden');
        stepForm.classList.remove('hidden');
        stepForm.classList.add('active');
    });

    // Confirm Send (Step 2 -> 3)
    confirmSendBtn.addEventListener('click', async () => {
        const amount = parseFloat(amountInput.value);
        const recipient = recipientInput.value;
        const note = noteInput.value;
        confirmSendBtn.textContent = 'Sending...';
        confirmSendBtn.disabled = true;

        try {
            await fetchApi('/transactions/send', {
                method: 'POST',
                body: JSON.stringify({ recipient, amount, note })
            });

            // Populate Success Data
            document.getElementById('successRecipient').textContent = recipient;
            document.getElementById('successAmount').textContent = formatCurrency(amount);
            document.getElementById('transactionRef').textContent = 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase();

            // Switch to Step 3
            stepConfirm.classList.remove('active');
            stepConfirm.classList.add('hidden');
            stepSuccess.classList.remove('hidden');
            stepSuccess.classList.add('active');
            loadDashboardData();
        } catch (err) {
            alert('Transfer failed: ' + err.message);
        } finally {
            confirmSendBtn.textContent = 'Send payment';
            confirmSendBtn.disabled = false;
        }
    });

    // Done button (Step 3 -> Close)
    doneBtn.addEventListener('click', closeModal);
    // Insights Modal Logic
    const insightsModal = document.getElementById('insightsModal');
    const navInsightsBtn = document.getElementById('navInsightsBtn');
    const closeInsightsBtn = document.getElementById('closeInsightsBtn');
    let chartInstance = null;

    if (navInsightsBtn) {
        navInsightsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            insightsModal.classList.remove('hidden');
            
            // Initialize Chart if not already done
            if (!chartInstance) {
                const ctx = document.getElementById('investmentsChart').getContext('2d');
                chartInstance = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Food & Dining', 'Transport', 'Entertainment', 'Groceries'],
                        datasets: [{
                            data: [45, 20, 15, 20],
                            backgroundColor: [
                                '#2563eb', // primary blue
                                '#f59e0b', // warning amber
                                '#10b981', // positive green
                                '#8b5cf6'  // purple
                            ],
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        cutout: '75%',
                        plugins: {
                            legend: {
                                position: 'right',
                                labels: {
                                    font: { family: "'Inter', sans-serif", size: 12 }
                                }
                            }
                        }
                    }
                });
            }
        });
    }

    const closeInsightsModal = () => {
        insightsModal.classList.add('hidden');
    };

    if (closeInsightsBtn) {
        closeInsightsBtn.addEventListener('click', closeInsightsModal);
    }

    insightsModal.addEventListener('click', (e) => {
        if (e.target === insightsModal) closeInsightsModal();
    });


    // Request Modal Logic
    const requestModal = document.getElementById('requestModal');
    const quickRequestBtn = document.getElementById('quickRequestBtn');
    const closeRequestBtn = document.getElementById('closeRequestBtn');
    const submitRequestBtn = document.getElementById('submitRequestBtn');
    const requestForm = document.getElementById('requestForm');
    const requestSuccess = document.getElementById('requestSuccess');
    const requestDoneBtn = document.getElementById('requestDoneBtn');

    const openRequestModal = () => {
        requestModal.classList.remove('hidden');
        requestForm.classList.remove('hidden');
        requestSuccess.classList.add('hidden');
        document.getElementById('requestForm').reset();
    };

    const closeRequestModal = () => {
        requestModal.classList.add('hidden');
    };

    if (quickRequestBtn) {
        quickRequestBtn.addEventListener('click', openRequestModal);
    }

    if (closeRequestBtn) {
        closeRequestBtn.addEventListener('click', closeRequestModal);
    }

    if (submitRequestBtn) {
        submitRequestBtn.addEventListener('click', () => {
            // Simple validation
            const amount = document.getElementById('requestAmount').value;
            if (!amount || amount <= 0) return;
            
            requestForm.classList.add('hidden');
            requestSuccess.classList.remove('hidden');
        });
    }

    if (requestDoneBtn) {
        requestDoneBtn.addEventListener('click', closeRequestModal);
    }

    requestModal.addEventListener('click', (e) => {
        if (e.target === requestModal) closeRequestModal();
    });

    // Cards Modal Logic
    const cardsModal = document.getElementById('cardsModal');
    const navCardsBtn = document.getElementById('navCardsBtn');
    const closeCardsBtn = document.getElementById('closeCardsBtn');
    const submitCardsBtn = document.getElementById('submitCardsBtn');
    const cardsForm = document.getElementById('cardsForm');
    const cardsSuccess = document.getElementById('cardsSuccess');
    const cardsDoneBtn = document.getElementById('cardsDoneBtn');

    const openCardsModal = (e) => {
        if(e) e.preventDefault();
        cardsModal.classList.remove('hidden');
        cardsForm.classList.remove('hidden');
        cardsSuccess.classList.add('hidden');
        document.getElementById('cardsForm').reset();
    };

    const closeCardsModal = () => {
        cardsModal.classList.add('hidden');
    };

    if (navCardsBtn) {
        navCardsBtn.addEventListener('click', openCardsModal);
    }

    if (closeCardsBtn) {
        closeCardsBtn.addEventListener('click', closeCardsModal);
    }

    if (submitCardsBtn) {
        submitCardsBtn.addEventListener('click', async () => {
            // Basic validation
            const amount = document.getElementById('cardAmount').value;
            const cardNum = document.getElementById('cardNumber').value;
            if (!amount || amount <= 0 || cardNum.length < 15) return;
            
            submitCardsBtn.textContent = 'Adding...';
            submitCardsBtn.disabled = true;
            try {
                await fetchApi('/account/add-money', {
                    method: 'POST',
                    body: JSON.stringify({ amount: parseFloat(amount) })
                });
                cardsForm.classList.add('hidden');
                cardsSuccess.classList.remove('hidden');
                loadDashboardData();
            } catch (err) {
                alert('Add money failed: ' + err.message);
            } finally {
                submitCardsBtn.textContent = 'Get Money';
                submitCardsBtn.disabled = false;
            }
        });
    }

    if (cardsDoneBtn) {
        cardsDoneBtn.addEventListener('click', closeCardsModal);
    }

    cardsModal.addEventListener('click', (e) => {
        if (e.target === cardsModal) closeCardsModal();
    });

    // Help Modal Logic
    const helpModal = document.getElementById('helpModal');
    const helpBtn = document.getElementById('helpBtn');
    const closeHelpBtn = document.getElementById('closeHelpBtn');
    const helpDoneBtn = document.getElementById('helpDoneBtn');

    const openHelpModal = () => {
        helpModal.classList.remove('hidden');
    };

    const closeHelpModal = () => {
        helpModal.classList.add('hidden');
    };

    if (helpBtn) helpBtn.addEventListener('click', openHelpModal);
    if (closeHelpBtn) closeHelpBtn.addEventListener('click', closeHelpModal);
    if (helpDoneBtn) helpDoneBtn.addEventListener('click', closeHelpModal);

    helpModal.addEventListener('click', (e) => {
        if (e.target === helpModal) closeHelpModal();
    });

    // Savings Plan Modal Logic
    const savingsPlanModal = document.getElementById('savingsPlanModal');
    const savingsPlanBtn = document.getElementById('savingsPlanBtn');
    const closeSavingsBtn = document.getElementById('closeSavingsBtn');
    const savingsDoneBtn = document.getElementById('savingsDoneBtn');
    let savingsChartInstance = null;

    const openSavingsModal = (e) => {
        if (e) e.preventDefault();
        savingsPlanModal.classList.remove('hidden');

        if (!savingsChartInstance) {
            const ctx = document.getElementById('savingsChart').getContext('2d');
            savingsChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6', 'Month 7'],
                    datasets: [{
                        label: 'Projected Savings ($)',
                        data: [3450, 3650, 3850, 4050, 4250, 4450, 5000],
                        borderColor: '#10b981', // positive green
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
                            min: 3000
                        }
                    }
                }
            });
        }
    };

    const closeSavingsModal = () => {
        savingsPlanModal.classList.add('hidden');
    };

    if (savingsPlanBtn) savingsPlanBtn.addEventListener('click', openSavingsModal);
    if (closeSavingsBtn) closeSavingsBtn.addEventListener('click', closeSavingsModal);
    if (savingsDoneBtn) savingsDoneBtn.addEventListener('click', closeSavingsModal);

    savingsPlanModal.addEventListener('click', (e) => {
        if (e.target === savingsPlanModal) closeSavingsModal();
    });

    // Scan Modal Logic
    const scanModal = document.getElementById('scanModal');
    const quickScanBtn = document.getElementById('quickScanBtn');
    const closeScanBtn = document.getElementById('closeScanBtn');
    const mockScanSuccessBtn = document.getElementById('mockScanSuccessBtn');
    const scanSuccess = document.getElementById('scanSuccess');
    const scanDoneBtn = document.getElementById('scanDoneBtn');

    const openScanModal = () => {
        scanModal.classList.remove('hidden');
        scanSuccess.classList.add('hidden');
        mockScanSuccessBtn.classList.remove('hidden');
    };

    const closeScanModal = () => {
        scanModal.classList.add('hidden');
    };

    if (quickScanBtn) quickScanBtn.addEventListener('click', openScanModal);
    if (closeScanBtn) closeScanBtn.addEventListener('click', closeScanModal);
    
    if (mockScanSuccessBtn) {
        mockScanSuccessBtn.addEventListener('click', () => {
            mockScanSuccessBtn.classList.add('hidden');
            scanSuccess.classList.remove('hidden');
        });
    }

    if (scanDoneBtn) {
        scanDoneBtn.addEventListener('click', closeScanModal);
    }

    scanModal.addEventListener('click', (e) => {
        if (e.target === scanModal) closeScanModal();
    });

    // Add Money Modal Logic
    const addMoneyModal = document.getElementById('addMoneyModal');
    const quickAddBtn = document.getElementById('quickAddBtn');
    const closeAddBtn = document.getElementById('closeAddBtn');
    
    // We can link "Credit/Debit Card" option to our existing Cards Modal
    const pmCreditCard = document.getElementById('pmCreditCard');

    const openAddMoneyModal = () => {
        addMoneyModal.classList.remove('hidden');
    };

    const closeAddMoneyModal = () => {
        addMoneyModal.classList.add('hidden');
    };

    if (quickAddBtn) quickAddBtn.addEventListener('click', openAddMoneyModal);
    if (closeAddBtn) closeAddBtn.addEventListener('click', closeAddMoneyModal);
    
    if (pmCreditCard) {
        pmCreditCard.addEventListener('click', () => {
            closeAddMoneyModal();
            openCardsModal(); // Open the cards modal we created earlier
        });
    }

    addMoneyModal.addEventListener('click', (e) => {
        if (e.target === addMoneyModal) closeAddMoneyModal();
    });

    // Close on Escape key for all new modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (!insightsModal.classList.contains('hidden')) closeInsightsModal();
            if (!requestModal.classList.contains('hidden')) closeRequestModal();
            if (!cardsModal.classList.contains('hidden')) closeCardsModal();
            if (!helpModal.classList.contains('hidden')) closeHelpModal();
            if (!savingsPlanModal.classList.contains('hidden')) closeSavingsModal();
            if (!scanModal.classList.contains('hidden')) closeScanModal();
            if (!addMoneyModal.classList.contains('hidden')) closeAddMoneyModal();
        }
    });

    // Auth Overlay Logic
    const authOverlay = document.getElementById('authOverlay');
    const signInSection = document.getElementById('signInSection');
    const registerSection = document.getElementById('registerSection');
    const showRegisterBtn = document.getElementById('showRegisterBtn');
    const showSignInBtn = document.getElementById('showSignInBtn');
    const signInForm = document.getElementById('signInForm');
    const registerForm = document.getElementById('registerForm');

    if (showRegisterBtn) {
        showRegisterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            signInSection.classList.add('hidden');
            registerSection.classList.remove('hidden');
        });
    }

    if (showSignInBtn) {
        showSignInBtn.addEventListener('click', (e) => {
            e.preventDefault();
            registerSection.classList.add('hidden');
            signInSection.classList.remove('hidden');
        });
    }

    const updateProfile = (name, email) => {
        const firstName = name.split(' ')[0] || name;
        const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';
        
        const greetingText = document.getElementById('greetingText');
        const profileName = document.getElementById('profileName');
        const profileAvatar = document.getElementById('profileAvatar');
        const modalName = document.getElementById('modalName');
        const modalEmail = document.getElementById('modalEmail');
        const modalAvatar = document.getElementById('modalAvatar');

        if(greetingText) greetingText.textContent = `Good morning, ${firstName}`;
        if(profileName) profileName.textContent = name;
        if(profileAvatar) profileAvatar.textContent = initials;
        
        if(modalName) modalName.textContent = name;
        if(modalEmail) modalEmail.textContent = `Personal Account • ${email}`;
        if(modalAvatar) modalAvatar.textContent = initials;
    };

    if (signInForm) {
        signInForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const emailInput = signInForm.querySelector('input[type="email"]');
            const pwdInput = signInForm.querySelector('input[type="password"]');
            const btn = signInForm.querySelector('button[type="submit"]');
            btn.textContent = 'Signing In...';
            btn.disabled = true;

            try {
                const data = await fetchApi('/auth/login', {
                    method: 'POST',
                    body: JSON.stringify({ email: emailInput.value, password: pwdInput.value })
                });
                localStorage.setItem('blowtech_token', data.token);
                localStorage.setItem('blowtech_user', JSON.stringify(data.user));
                currentUser = data.user;
                updateProfile(currentUser.fullName, currentUser.email);
                authOverlay.classList.add('hidden');
                loadDashboardData();
            } catch (err) {
                alert('Sign In Failed: ' + err.message);
            } finally {
                btn.textContent = 'Sign In';
                btn.disabled = false;
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nameInput = registerForm.querySelector('input[type="text"]');
            const emailInput = registerForm.querySelector('input[type="email"]');
            const pwdInput = registerForm.querySelector('input[type="password"]');
            const btn = registerForm.querySelector('button[type="submit"]');
            btn.textContent = 'Registering...';
            btn.disabled = true;

            try {
                const data = await fetchApi('/auth/register', {
                    method: 'POST',
                    body: JSON.stringify({ fullName: nameInput.value, email: emailInput.value, password: pwdInput.value })
                });
                localStorage.setItem('blowtech_token', data.token);
                localStorage.setItem('blowtech_user', JSON.stringify(data.user));
                currentUser = data.user;
                updateProfile(currentUser.fullName, currentUser.email);
                authOverlay.classList.add('hidden');
                loadDashboardData();
            } catch (err) {
                alert('Registration Failed: ' + err.message);
            } finally {
                btn.textContent = 'Register';
                btn.disabled = false;
            }
        });
    }

    // Connect Sidebar Payments button to Send Money Modal
    const navPaymentsBtn = document.getElementById('navPaymentsBtn');
    if (navPaymentsBtn) {
        navPaymentsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(); // Function already exists at top of app.js for Send Money Modal
        });
    }

    // Notification Modal Logic
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationModal = document.getElementById('notificationModal');
    const closeNotificationBtn = document.getElementById('closeNotificationBtn');
    const clearNotificationsBtn = document.getElementById('clearNotificationsBtn');

    const openNotificationModal = () => {
        if (notificationModal) notificationModal.classList.remove('hidden');
    };

    const closeNotificationModal = () => {
        if (notificationModal) notificationModal.classList.add('hidden');
    };

    if (notificationBtn) {
        notificationBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openNotificationModal();
        });
    }

    if (closeNotificationBtn) {
        closeNotificationBtn.addEventListener('click', closeNotificationModal);
    }

    if (notificationModal) {
        notificationModal.addEventListener('click', (e) => {
            if (e.target === notificationModal) closeNotificationModal();
        });
    }

    if (clearNotificationsBtn) {
        clearNotificationsBtn.addEventListener('click', () => {
            // In a real app this would clear the DB, here we just close or hide content
            closeNotificationModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && notificationModal && !notificationModal.classList.contains('hidden')) {
            closeNotificationModal();
        }
    });

    // Profile Modal Logic
    const profileBtn = document.getElementById('profileBtn');
    const profileModal = document.getElementById('profileModal');
    const closeProfileBtn = document.getElementById('closeProfileBtn');
    const signOutBtn = document.getElementById('signOutBtn');

    const openProfileModal = () => {
        if (profileModal) profileModal.classList.remove('hidden');
    };

    const closeProfileModal = () => {
        if (profileModal) profileModal.classList.add('hidden');
    };

    if (profileBtn) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openProfileModal();
        });
    }

    if (closeProfileBtn) {
        closeProfileBtn.addEventListener('click', closeProfileModal);
    }

    if (profileModal) {
        profileModal.addEventListener('click', (e) => {
            if (e.target === profileModal) closeProfileModal();
        });
    }

    // Escape key handling for profile modal is already covered generally if we add it, but let's be explicit
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && profileModal && !profileModal.classList.contains('hidden')) {
            closeProfileModal();
        }
    });

    // Sign Out Logic
    if (signOutBtn) {
        signOutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('blowtech_token');
            localStorage.removeItem('blowtech_user');
            currentUser = null;
            closeProfileModal();
            authOverlay.classList.remove('hidden');
            totalBalanceEl.textContent = '$0.00';
            availableBalanceEl.textContent = '$0.00';
            transactionsList.innerHTML = '';
        });
    }

    // Initialize Auth state on load
    if (currentUser && localStorage.getItem('blowtech_token')) {
        authOverlay.classList.add('hidden');
        updateProfile(currentUser.fullName, currentUser.email);
        loadDashboardData();
    }

    window.renderNotifications = (notifications) => {
        const notifBody = document.querySelector('#notificationModal .modal-body');
        if (!notifBody) return;
        
        let html = '';
        if (!notifications || notifications.length === 0) {
            html = '<div style="padding: 12px; text-align:center; color: var(--text-secondary); font-size: 0.875rem;">No new notifications</div>';
        } else {
            notifications.forEach(n => {
                html += `
                <div style="padding: 12px; border-bottom: 1px solid var(--border-color);">
                    <h5 style="margin-bottom: 4px; font-size: 0.875rem; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
                        <i data-lucide="info" style="width: 16px; height: 16px; color: var(--primary-action);"></i>
                        ${n.title}
                    </h5>
                    <p style="font-size: 0.75rem; color: var(--text-secondary);">${n.message}</p>
                    <span style="font-size: 0.65rem; color: #999;">${new Date(n.createdAt).toLocaleDateString()}</span>
                </div>
                `;
            });
        }
        notifBody.innerHTML = html + '<button type="button" class="btn btn-secondary full-width mt-4" id="clearNotificationsBtn">Clear All</button>';
        
        // Re-attach clear button logic
        document.getElementById('clearNotificationsBtn')?.addEventListener('click', closeNotificationModal);
        lucide.createIcons();
    };

});
