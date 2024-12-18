document.addEventListener('DOMContentLoaded', () => {
    const colors = ["#FF5733", "#2E8B57", "#3357FF", "#F1C40F", "#8E44AD", "#1ABC9C", "#E74C3C", "#2C3E50"];
    let usedColors = new Set();


    const matrixContainer = document.getElementById('matrix-container');
    matrixContainer.innerHTML = `
        <table id="matrixTable">
            <thead>
                <tr>
                    <th>Circle</th>
                    <th>Sample</th>
                    <th>Steps</th>
                    <th>Density</th>
                    <th>Phase</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody></tbody>
            <tfoot>
                <tr id="addRowButtonRow">
                    <td colspan="6"><button class="add-row-btn">+</button></td>
                </tr>
            </tfoot>
        </table>
    `;

    // Funzioni di supporto
    function getNextColor() {
        for (const color of colors) {
            if (!usedColors.has(color)) {
                usedColors.add(color);
                return color;
            }
        }
        return null;
    }

    function releaseColor(color) {
        usedColors.delete(color);
    }

    function populateDropdowns(row, steps) {
        const densityDropdown = row.querySelector('.density-dropdown');
        const phaseDropdown = row.querySelector('.phase-dropdown');
        densityDropdown.innerHTML = '';
        phaseDropdown.innerHTML = '';

        for (let i = 0; i <= 1; i += 1 / steps) {
            const option = document.createElement('option');
            option.value = (i * 100).toFixed(0);
            option.textContent = `${(i * 100).toFixed(0)}%`;
            densityDropdown.appendChild(option);
        }

        for (let i = 0; i < steps; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            phaseDropdown.appendChild(option);
        }
    }

    function addRow() {
        const tableBody = document.querySelector('#matrixTable tbody');
        const newRow = document.createElement('tr');

        const color = getNextColor();
        if (!color) {
            alert('No available colors for new rows.');
            return;
        }

        newRow.innerHTML = `
            <td><div class="color-box" style="background-color: ${color};"></div></td>
            <td>Drop the sample here!</td>
            <td>
                <select class="steps-dropdown" style="background-color: ${color};">
                    ${Array.from({ length: 15 }, (_, i) => `<option value="${i + 2}">${i + 2}</option>`).join('')}
                </select>
            </td>
            <td>
                <select class="density-dropdown" style="background-color: ${color};"></select>
            </td>
            <td>
                <select class="phase-dropdown" style="background-color: ${color};"></select>
            </td>
            <td><button class="remove-btn">x</button></td>
        `;

        const stepsDropdown = newRow.querySelector('.steps-dropdown');
        const defaultSteps = parseInt(stepsDropdown.value, 10);
        populateDropdowns(newRow, defaultSteps);

        stepsDropdown.addEventListener('change', event => {
            const steps = parseInt(event.target.value, 10);
            if (!isNaN(steps)) {
                populateDropdowns(newRow, steps);
            }
        });

        newRow.querySelector('.remove-btn').addEventListener('click', () => {
            releaseColor(color);
            newRow.remove();
            toggleAddButtonVisibility();
        });

        tableBody.appendChild(newRow);
        toggleAddButtonVisibility();
    }

    function toggleAddButtonVisibility() {
        const tableBody = document.querySelector('#matrixTable tbody');
        const addRowButtonRow = document.querySelector('#addRowButtonRow');
        addRowButtonRow.style.display = tableBody.children.length >= 6 ? 'none' : '';
    }

    document.querySelector('.add-row-btn').addEventListener('click', addRow);
    addRow();
});
//commento