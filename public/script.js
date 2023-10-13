document.addEventListener('DOMContentLoaded', () => {
    fetchTableNames();

    async function fetchTableNames() {
        const response = await fetch('/tables');
        const tables = await response.json();
        displayTableNames(tables);
    }

    function displayTableNames(tables) {
        const tableList = document.getElementById('tableList');
        tables.forEach(table => {
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item list-group-item-action';
            listItem.textContent = table.name;
            listItem.onclick = () => fetchTableData(table.name);
            tableList.appendChild(listItem);
        });
    }

    async function fetchTableData(tableName) {
        document.getElementById('queryInput').value = `SELECT * FROM ${tableName};`;

        const response = await fetch(`/data/${tableName}`);
        const data = await response.json();
        displayData(data);
    }

    function displayData(data) {
        const messageDiv = $('#message');

        createDataTable(); // Initialize DataTable

        // Check if data is non-empty
        if (data && data.length > 0) {
            // Dynamically generate headers based on keys of the first data object
            const headers = Object.keys(data[0]);
            
            // Initialize DataTable and display the data
            $('#data-table').DataTable({
                data: data,
                columns: headers.map(header => ({ data: header, title: header })),
                destroy: true, // Destroy the DataTable object before reinitializing
            });

            messageDiv.hide(); // Hide the message div

        } else if (data && data.message) {
            messageDiv.text(data.message).addClass('alert-danger').show();
            table.appendChild(noDataMessage);
        }
        else {
            messageDiv.text('No data available')
                .addClass('alert-warning').show(); // Show message
        }
    }

    // function displayData(data) {
    //     const table = document.getElementById('dataTable');
    //     table.innerHTML = '';

    //     if (data && data.length > 0) {
    //         const thead = document.createElement('thead');
    //         const headerRow = document.createElement('tr');
    //         Object.keys(data[0]).forEach(key => {
    //             const th = document.createElement('th');
    //             th.textContent = key;
    //             headerRow.appendChild(th);
    //         });
    //         thead.appendChild(headerRow);
    //         table.appendChild(thead);

    //         const tbody = document.createElement('tbody');
    //         data.forEach(row => {
    //             const tr = document.createElement('tr');
    //             Object.values(row).forEach(value => {
    //                 const td = document.createElement('td');
    //                 td.textContent = value;
    //                 tr.appendChild(td);
    //             });
    //             tbody.appendChild(tr);
    //         });
    //         table.appendChild(tbody);
    //     } else if (data && data.message) {
    //         const noDataMessage = document.createElement('p');
    //         noDataMessage.style.color = 'red';
    //         noDataMessage.textContent = data.message;
    //         table.appendChild(noDataMessage);
    //     }
    //     else {
    //         const noDataMessage = document.createElement('p');
    //         noDataMessage.textContent = 'No data available';
    //         table.appendChild(noDataMessage);
    //     }
    // }

    fetchQueryData = async () => {
        const queryInput = document.getElementById('queryInput').value;

        // Perform client-side validation if needed
        if (queryInput.trim().length === 0) {
            return;
        }

        // if (!queryInput || !isValidSQL(queryInput)) {
        //     alert('Please enter a valid SQL query.');
        //     return;
        // }

        const response = await fetch('/query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: queryInput }),
        });

        const data = await response.json();
        displayData(data);
    }

    clearQueryInput = () => {
        $('#queryInput').val('').focus();
        $('#message').hide();
        createDataTable();
    }

    // Initialize DataTable
    function createDataTable() {
        $('#data-table-container').html(`
        <table id="data-table" class="display"></table>        
    `);
    }
});


// // helper function to validate SQL statements
// function isValidSQL(sql) {
//     // Very basic regex patterns for SELECT, INSERT, UPDATE, DELETE statements
//     const selectRegex = /^\s*SELECT\s+.+?\s+FROM\s+.+/i;
//     const insertRegex = /^\s*INSERT\s+INTO\s+.+?\(.+?\)\s+VALUES\s*\(.+?\)/i;
//     const updateRegex = /^\s*UPDATE\s+.+?\s+SET\s+.+?\s+WHERE\s+.+/i;
//     const deleteRegex = /^\s*DELETE\s+FROM\s+.+?\s+WHERE\s+.+/i;
//     const createRegex = /^\s*CREATE\s+/i;

//     return selectRegex.test(sql) || insertRegex.test(sql) || updateRegex.test(sql) || deleteRegex.test(sql) || createRegex.test(sql);
// }


