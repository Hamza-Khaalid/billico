 // Initialize variables and DOM references
        let documentMode = 'invoice';
        let currencySymbol = '$';
        let status = 'Unpaid';
        let nextDocumentNumber = 1;
        
        // DOM elements
        const invoiceToggle = document.getElementById('invoiceToggle');
        const receiptToggle = document.getElementById('receiptToggle');
        const currencySelector = document.getElementById('currencySelector');
        const customerFields = document.getElementById('customerFields');
        const paymentMethodField = document.getElementById('paymentMethodField');
        const itemsContainer = document.getElementById('itemsContainer');
        const addItemBtn = document.getElementById('addItemBtn');
        const generateBtn = document.getElementById('generateBtn');
        const documentPreview = document.getElementById('documentPreview');
        const exportPNG = document.getElementById('exportPNG');
        const exportPDF = document.getElementById('exportPDF');
        const unpaidToggle = document.getElementById('unpaidToggle');
        const paidToggle = document.getElementById('paidToggle');
        
        // Currency symbols mapping
        const currencySymbols = {
            'USD': '$',
            'EUR': '€',
            'GBP': '£',
            'JPY': '¥',
            'AUD': '$',
            'CAD': '$',
            'INR': '₹',
            'PKR': '₨'
        };
        
        // Set today's date as default
        function setDefaultDates() {
            const today = new Date();
            const dueDate = new Date();
            dueDate.setDate(today.getDate() + 30);
            
            document.getElementById('documentDate').valueAsDate = today;
            document.getElementById('dueDate').valueAsDate = dueDate;
        }
        
        // Initialize the app
        function init() {
            setDefaultDates();
            updateCurrencySymbol();
            setupEventListeners();
        }
        
        // Update currency symbol based on selection
        function updateCurrencySymbol() {
            const currency = currencySelector.value;
            currencySymbol = currencySymbols[currency] || '$';
        }
        
        // Set up event listeners
        function setupEventListeners() {
            // Mode toggles
            invoiceToggle.addEventListener('click', () => setDocumentMode('invoice'));
            receiptToggle.addEventListener('click', () => setDocumentMode('receipt'));
            
            // Currency change
            currencySelector.addEventListener('change', updateCurrencySymbol);
            
            // Status toggles
            unpaidToggle.addEventListener('click', () => setStatus('Unpaid'));
            paidToggle.addEventListener('click', () => setStatus('Paid'));
            
            // Add item button
            addItemBtn.addEventListener('click', addItemRow);
            
            // Generate button
            generateBtn.addEventListener('click', generateDocument);
            
            // Export buttons
            exportPNG.addEventListener('click', exportAsPNG);
            exportPDF.addEventListener('click', exportAsPDF);
            
            // Remove item event delegation
            itemsContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('remove-item')) {
                    removeItemRow(e.target.closest('.item-row'));
                }
            });
        }
        
        // Set document mode (invoice or receipt)
        function setDocumentMode(mode) {
            documentMode = mode;
            
            // Update UI
            if (mode === 'invoice') {
                invoiceToggle.classList.add('active');
                receiptToggle.classList.remove('active');
                customerFields.classList.remove('hidden');
                paymentMethodField.classList.add('hidden');
            } else {
                invoiceToggle.classList.remove('active');
                receiptToggle.classList.add('active');
                customerFields.classList.add('hidden');
                paymentMethodField.classList.remove('hidden');
                setStatus('Paid'); // Receipts are always paid
            }
        }
        
        // Set payment status
        function setStatus(newStatus) {
            status = newStatus;
            
            if (newStatus === 'Unpaid') {
                unpaidToggle.classList.add('active');
                paidToggle.classList.remove('active');
            } else {
                unpaidToggle.classList.remove('active');
                paidToggle.classList.add('active');
            }
        }
        
        // Add new item row
        function addItemRow() {
            const itemRow = document.createElement('div');
            itemRow.className = 'item-row';
            itemRow.innerHTML = `
                <input type="text" placeholder="Item description" class="item-desc" aria-label="Item description">
                <input type="number" placeholder="Qty" class="item-qty" value="1" min="1" aria-label="Item quantity">
                <input type="number" placeholder="Price" class="item-price" value="0" min="0" step="0.01" aria-label="Item price">
                <button class="remove-item" aria-label="Remove item">×</button>
            `;
            itemsContainer.appendChild(itemRow);
        }
        
        // Remove item row
        function removeItemRow(row) {
            if (itemsContainer.children.length > 1) {
                row.remove();
            }
        }
        
        // Calculate totals
        function calculateTotals() {
            let subtotal = 0;
            
            // Get all item rows
            const itemRows = document.querySelectorAll('.item-row');
            itemRows.forEach(row => {
                const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
                const price = parseFloat(row.querySelector('.item-price').value) || 0;
                subtotal += qty * price;
            });
            
            // Apply tax and discount
            const taxRate = parseFloat(document.getElementById('taxRate').value) || 0;
            const discountRate = parseFloat(document.getElementById('discountRate').value) || 0;
            
            const taxAmount = subtotal * (taxRate / 100);
            const discountAmount = subtotal * (discountRate / 100);
            const total = subtotal + taxAmount - discountAmount;
            
            return {
                subtotal: subtotal.toFixed(2),
                taxAmount: taxAmount.toFixed(2),
                discountAmount: discountAmount.toFixed(2),
                total: total.toFixed(2)
            };
        }
        
        // Generate document preview
        function generateDocument() {
            // Add bounce animation to button
            generateBtn.classList.add('bounce');
            setTimeout(() => generateBtn.classList.remove('bounce'), 500);
            
            // Get form values
            const businessName = document.getElementById('businessName').value || 'Your Business';
            const documentDate = document.getElementById('documentDate').value;
            const documentNumber = document.getElementById('documentNumber').value || 'DOC-001';
            const customerName = document.getElementById('customerName').value || 'Customer';
            const customerEmail = document.getElementById('customerEmail').value || 'Customer Email';
            const dueDate = document.getElementById('dueDate').value;
            const paymentMethod = document.getElementById('paymentMethod').value || 'Cash';
            
            // Calculate totals
            const totals = calculateTotals();
            
            // Generate items HTML
            let itemsHTML = '';
            const itemRows = document.querySelectorAll('.item-row');
            itemRows.forEach(row => {
                const desc = row.querySelector('.item-desc').value || 'Item';
                const qty = row.querySelector('.item-qty').value || 0;
                const price = row.querySelector('.item-price').value || 0;
                const total = (parseFloat(qty) * parseFloat(price)).toFixed(2);
                
                itemsHTML += `
                    <tr>
                        <td>${desc}</td>
                        <td>${qty}</td>
                        <td>${currencySymbol}${parseFloat(price).toFixed(2)}</td>
                        <td>${currencySymbol}${total}</td>
                    </tr>
                `;
            });
            
            // Determine document title
            const docTitle = documentMode === 'invoice' ? 'INVOICE' : 'RECEIPT';
            
            // Build preview HTML
            const previewHTML = `
                <div class="document-title">${docTitle}</div>
                <div class="store-name">${businessName}</div>
                
                <div class="document-details">
                    <div>Date:</div>
                    <div>${formatDate(documentDate)}</div>
                    <div>${documentMode === 'invoice' ? 'Invoice' : 'Receipt'} #:</div>
                    <div>${documentNumber}</div>
                </div>
                
                ${documentMode === 'invoice' ? `
                    <div class="document-details">
                        <div>Customer:</div>
                        <div>${customerName}</div>
                        <div>Customer Email:</div>
                        <div>${customerEmail}</div>
                        
                        <div>Due Date:</div>
                        <div>${formatDate(dueDate)}</div>
                    </div>
                ` : ''}
                
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Qty</th>
                            <th>Unit Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHTML}
                    </tbody>
                </table>
                
                <div class="document-details">
                    <div>Subtotal:</div>
                    <div>${currencySymbol}${totals.subtotal}</div>
                    
                    <div>Tax (${document.getElementById('taxRate').value || 0}%):</div>
                    <div>${currencySymbol}${totals.taxAmount}</div>
                    
                    <div>Discount (${document.getElementById('discountRate').value || 0}%):</div>
                    <div>-${currencySymbol}${totals.discountAmount}</div>
                    
                    <div class="total-row">${documentMode === 'invoice' ? 'TOTAL DUE' : 'TOTAL PAID'}:</div>
                    <div class="total-row">${currencySymbol}${totals.total}</div>
                </div>
                
                ${documentMode === 'invoice' ? `
                    <div class="status-badge ${status === 'Unpaid' ? 'unpaid' : 'paid'}">${status}</div>
                ` : `
                    <div class="payment-method">Payment Method: ${paymentMethod}</div>
                `}
                
                <div class="thank-you">Thank you for your business!</div>
            `;
            
            // Update preview
            documentPreview.innerHTML = previewHTML;
            documentPreview.classList.add('visible');
            
            // Increment document number for next time
            nextDocumentNumber = parseInt(documentNumber.match(/\d+$/)?.[0] || 0) + 1;
            document.getElementById('documentNumber').value = 
                documentNumber.replace(/\d+$/, '') + nextDocumentNumber;
        }
        
        // Format date for display
        function formatDate(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
        
        // Export as PNG with high quality
function exportAsPNG() {
    if (!documentPreview.classList.contains('visible')) {
        alert('Please generate a document first');
        return;
    }

    // Use higher scale (2x-3x) for better quality
    const scale = window.devicePixelRatio * 2; // Adjust multiplier as needed
    
    html2canvas(documentPreview, {
        scale: scale,
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF'
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = `${documentMode}-${new Date().getTime()}.png`;
        link.href = canvas.toDataURL('image/png', 1.0); // Highest quality
        link.click();
    });
}

// Export as PDF with high quality
function exportAsPDF() {
    if (!documentPreview.classList.contains('visible')) {
        alert('Please generate a document first');
        return;
    }

    const scale = window.devicePixelRatio * 2;
    
    html2canvas(documentPreview, {
        scale: scale,
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF'
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png', 1.0);
        const pdf = new jspdf.jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        
        // Calculate aspect ratio
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = imgWidth / imgHeight;
        
        // Fit image to page while maintaining aspect ratio
        let pdfWidth = pageWidth;
        let pdfHeight = pageWidth / ratio;
        
        if (pdfHeight > pageHeight) {
            pdfHeight = pageHeight;
            pdfWidth = pageHeight * ratio;
        }

        // Center image on page
        const marginX = (pageWidth - pdfWidth) / 2;
        const marginY = (pageHeight - pdfHeight) / 2;

        pdf.addImage(
            imgData, 
            'PNG', 
            marginX, 
            marginY, 
            pdfWidth, 
            pdfHeight
        );
        
        pdf.save(`${documentMode}-${new Date().getTime()}.pdf`);
    });
}
        
        // Initialize the application
        window.addEventListener('DOMContentLoaded', init);