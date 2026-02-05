
        // State
        let currentWeight = "0"; // Represents the keypad input
        let totalWeightAccumulated = 0;
        let totalPriceAccumulated = 0;
        let selectedGradeId = "rubber";

        const grades = [
            { id: 'rubber', name: 'ລາຄາຢາງ', price: 30.00 }
        ];

        let transactions = [];
        let currentCustomerName = "";

        // Init
        function init() {
            // Load saved rates
            const savedGrades = localStorage.getItem('rubber_rates');
            if (savedGrades) {
                try {
                    const parsed = JSON.parse(savedGrades);
                    // Update current grades array with saved prices
                    parsed.forEach(saved => {
                        const grade = grades.find(g => g.id === saved.id);
                        if (grade) grade.price = saved.price;
                    });
                } catch (e) { console.error("Error loading rates", e); }
            }

            // Load saved transactions (optional but helpful for persistence)
            const savedTx = localStorage.getItem('rubber_transactions');
            if (savedTx) {
                try {
                    transactions = JSON.parse(savedTx);
                    // Recalculate totals from loaded transactions
                    totalWeightAccumulated = transactions.reduce((sum, tx) => sum + tx.weight, 0);
                    totalPriceAccumulated = transactions.reduce((sum, tx) => sum + tx.price, 0);
                } catch (e) { console.error("Error loading history", e); }
            }

            renderGrades();
            renderHistory();
            updateDisplay();

            // Add click listener to ADD button
            const addBtn = document.getElementById('addBtn');
            if (addBtn) addBtn.onclick = addToSession;
        }

        // Logic
        function inputDigit(digit) {
            if (currentWeight === "0" && digit !== ".") {
                currentWeight = digit;
            } else {
                if (digit === "." && currentWeight.includes(".")) return;
                if (currentWeight.length > 7) return; // Max length
                currentWeight += digit;
            }
            updateDisplay();
        }

        function inputDelete() {
            if (currentWeight.length === 1) {
                currentWeight = "0";
            } else {
                currentWeight = currentWeight.slice(0, -1);
            }
            updateDisplay();
        }

        function clearInput() {
            currentWeight = "0";
            updateDisplay();
        }

        function addToSession() {
            const weight = parseFloat(currentWeight);
            if (weight <= 0) return;

            const grade = grades.find(g => g.id === selectedGradeId);
            const price = weight * grade.price;

            // Add to totals
            totalWeightAccumulated += weight;
            totalPriceAccumulated += price;

            // Add to history
            const now = new Date();
            const timeString = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0') + " ໂມງ";

            const newTx = {
                id: Date.now(),
                weight: weight,
                price: price,
                time: timeString
            };

            transactions.unshift(newTx);
            localStorage.setItem('rubber_transactions', JSON.stringify(transactions));
            renderHistory();

            // Allow next input
            currentWeight = "0";
            updateDisplay();
        }

        function selectGrade(id) {
            selectedGradeId = id;
            renderGrades();
            // Payout calculation for individual item is handled in addToSession/updatePayout logic implicitly
        }

        function updateDisplay() {
            // Update Input Box
            const inputDisplay = document.getElementById('currentInputDisplay');
            if (inputDisplay) inputDisplay.innerText = currentWeight === "0" ? "0.00" : currentWeight;

            // Update Totals (Center Panel)
            const totalWeightEl = document.getElementById('totalWeightDisplay');
            if (totalWeightEl) totalWeightEl.innerText = totalWeightAccumulated.toFixed(2);

            const totalPriceEl = document.getElementById('totalPriceDisplay');
            if (totalPriceEl) totalPriceEl.innerText = totalPriceAccumulated.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            // Update Payout (Right Panel Footer)
            const payoutEl = document.getElementById('payoutAmount');
            if (payoutEl) {
                payoutEl.innerText = totalPriceAccumulated.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " ₭";
            }
        }

        // Deprecated but kept for safety if referenced
        function updatePayout() {
            // Logic moved to updateDisplay mostly
        }

        function saveTransaction() {
            if (totalWeightAccumulated <= 0) {
                alert("ກະລຸນາເພີ່ມລາຍການກ່ອນບັນທຶກ");
                return;
            }
            document.getElementById('customerModal').style.display = 'flex';
            document.getElementById('customerNameInput').focus();
        }

        function confirmCustomer() {
            const nameInput = document.getElementById('customerNameInput');
            const name = nameInput.value.trim();

            if (!name) {
                alert("ກະລຸນາກະລອກຊື່ລູກຄ້າກ່ອນບັນທຶກ!");
                nameInput.focus();
                return;
            }

            currentCustomerName = name;

            closeModal('customerModal');
            renderReceipt();
            document.getElementById('receiptModal').style.display = 'flex';
        }

        function closeModal(id) {
            document.getElementById(id).style.display = 'none';
        }

        function renderReceipt() {
            const content = document.getElementById('receiptContent');
            const now = new Date();
            const dateStr = now.toLocaleDateString('lo-LA', { year: 'numeric', month: 'long', day: 'numeric' });
            const timeStr = now.toLocaleTimeString('lo-LA', { hour: '2-digit', minute: '2-digit' });

            content.innerHTML = `
                <div class="receipt-header">
                    <h2 style="margin: 0; color: #00C853;">RubberTrade</h2>
                    <p style="margin: 4px 0 0; font-size: 0.9rem;">ໃບບິນລາຍການຊັ່ງນ້ຳໜັກຢາງ</p>
                </div>
                
                <div style="margin-bottom: 20px; font-size: 0.9rem;">
                    <div style="display: flex; justify-content: space-between;">
                        <span>ລູກຄ້າ: <strong>${currentCustomerName}</strong></span>
                        <span>ວັນທີ: ${dateStr}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-top: 4px;">
                        <span>ຜູ້ຮັບຊື້: ທ້າວ ລາມົວ</span>
                        <span>ເວລາ: ${timeStr} ໂມງ</span>
                    </div>
                </div>

                <table class="receipt-table">
                    <thead>
                        <tr>
                            <th>ລາຍການ</th>
                            <th style="text-align: right;">ນ້ຳໜັກ (kg)</th>
                            <th style="text-align: right;">ລາຄາ (₭)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${transactions.map((tx, idx) => `
                            <tr>
                                <td> ${transactions.length - idx}</td>
                                <td style="text-align: right;">${tx.weight.toFixed(2)}</td>
                                <td style="text-align: right;">${tx.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                        `).reverse().join('')}
                    </tbody>
                </table>

                <div class="receipt-total">
                    <div class="total-row">
                        <span>ນ້ຳໜັກລວມທັງໝົດ</span>
                        <span>${totalWeightAccumulated.toFixed(2)} kg</span>
                    </div>
                    <div class="total-row" style="color: #00C853; font-size: 1.4rem;">
                        <span>ລາຄະລວມທັງໝົດ</span>
                        <span>${totalPriceAccumulated.toLocaleString(undefined, { minimumFractionDigits: 2 })} ₭</span>
                    </div>
                </div>

                <div style="margin-top: 30px; text-align: center; font-size: 0.8rem; color: #888; display: none; display: block;" class="print-only-info">
                    <p>ຂອບໃຈທີ່ໃຊ້ບໍລິການ RubberTrade</p>
                    <p>*** ບິນນີ້ພິມຈາກລະບົບດິຈິຕອລ ***</p>
                </div>
            `;
        }

        function printReceipt() {
            window.print();

            // After print dialog closes, we can assume it's "saved"
            finalizeSave();
        }

        function finalizeSave() {
            alert(`ບັນທຶກຂໍ້ມູນຮຽບຮ້ອຍແລ້ວ!\nລູກຄ້າ: ${currentCustomerName}\nຍອດລວມ: ${totalPriceAccumulated.toLocaleString()} ₭`);

            // Reset Session
            totalWeightAccumulated = 0;
            totalPriceAccumulated = 0;
            transactions = [];
            currentWeight = "0";
            currentCustomerName = "";
            document.getElementById('customerNameInput').value = "";
            localStorage.removeItem('rubber_transactions');

            closeModal('receiptModal');
            renderHistory();
            updateDisplay();
        }

        // Renders
        function renderGrades() {
            // Grade selection removed as requested
            const dList = document.getElementById('desktopPriceList');
            if (dList) dList.innerHTML = '';

            const mList = document.getElementById('mobileGradeSelector');
            if (mList) mList.innerHTML = '';
        }

        function deleteTransaction(id) {
            const index = transactions.findIndex(t => t.id === id);
            if (index !== -1) {
                const tx = transactions[index];
                totalWeightAccumulated -= tx.weight;
                totalPriceAccumulated -= tx.price;
                transactions.splice(index, 1);
                localStorage.setItem('rubber_transactions', JSON.stringify(transactions));
                renderHistory();
                updateDisplay();
            }
        }

        function renderHistory() {
            // Mobile List
            const mobileList = document.getElementById('mobileHistoryList');
            if (mobileList) {
                if (transactions.length === 0) {
                    mobileList.innerHTML = '<div style="text-align: center; color: #999; margin-top: 40px;">No Recent Transactions</div>';
                } else {
                    mobileList.innerHTML = `
                        <div style="margin-bottom:10px; font-weight:600; color:#666; font-size:0.9rem;">ລາຍການຫຼ້າສຸດ</div>
                        ` + transactions.map(tx => `
                        <div class="history-card" style="position: relative; display: flex; align-items: center; justify-content: space-between; gap: 12px;">
                            <div style="flex: 1;">
                                <div class="h-weight">${tx.weight.toFixed(2)} kg</div>
                                <div class="h-time">${tx.time}</div>
                            </div>
                            <div class="h-price" style="flex: 1; text-align: center;">${tx.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₭</div>
                            <button onclick="deleteTransaction(${tx.id})" style="background: #ffebee; color: #ef5350; border: none; width: 32px; height: 32px; border-radius: 8px; font-size: 1.2rem; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0;">&times;</button>
                        </div>
                    `).join('');
                }
            }

            // Desktop List (Right Panel)
            const desktopList = document.getElementById('desktopPriceList');
            if (desktopList) {
                if (transactions.length === 0) {
                    desktopList.innerHTML = '<div style="text-align: center; color: #999; margin-top: 40px;">No Recent Transactions</div>';
                } else {
                    desktopList.innerHTML = transactions.map(tx => `
                        <div class="price-item" style="cursor: default; background: white; border: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; gap: 12px;">
                            <div style="flex: 1;">
                                <div style="font-weight: 700; font-size: 1.1rem;">${tx.weight.toFixed(2)} kg</div>
                                <div style="font-size: 0.85rem; color: #888;">${tx.time}</div>
                            </div>
                            
                            <div style="text-align: center; flex: 1;">
                                <div style="font-weight: 600; color: #00C853; font-size: 1.1rem;">${tx.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₭</div>
                                <div style="font-size: 0.8rem; color: #aaa;">&nbsp;</div>
                            </div>

                            <button onclick="deleteTransaction(${tx.id})" 
                                style="background: #ffebee; color: #ef5350; border: none; width: 36px; height: 36px; border-radius: 8px; font-size: 1.2rem; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                &times;
                            </button>
                        </div>
                    `).join('');
                }
            }
        }

        // Modal Functions
        function openPriceModal() {
            const modal = document.getElementById('priceModal');
            const inputList = document.getElementById('modalInputList');

            // Populate inputs
            inputList.innerHTML = grades.map(grade => `
                <div class="price-input-group">
                    <label>${grade.name}</label>
                    <div class="price-input-wrapper">
                        <input type="number" step="0.01" id="price-input-${grade.id}" value="${grade.price}">
                        <span>₭</span>
                    </div>
                </div>
            `).join('');

            modal.style.display = 'flex';
        }

        function closePriceModal() {
            document.getElementById('priceModal').style.display = 'none';
        }

        function savePrices() {
            grades.forEach(grade => {
                const input = document.getElementById(`price-input-${grade.id}`);
                if (input) {
                    grade.price = parseFloat(input.value);
                }
            });

            // Persist to localStorage
            localStorage.setItem('rubber_rates', JSON.stringify(grades));

            // Re-calculate session price if there's an ongoing input (mostly for UI consistency)
            updateDisplay();
            closePriceModal();
            alert("ບັນທຶກລາຄາໃໝ່ຮຽບຮ້ອຍແລ້ວ");
        }

        // Run
        init();

        // Mobile Specific Layout Tweaks via JS if CSS isn't enough
        const styleSheet = document.createElement("style");
        styleSheet.innerText = `
            @media (max-width: 768px) {
                .input-row { display: flex !important; }
                .mobile-bottom-bar { display: block !important; }
                .desktop-only { display: none !important; }
            }
        `;
        document.head.appendChild(styleSheet);

