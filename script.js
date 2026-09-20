// ==========================================
// INTERNTRACK - APPLICATION MANAGER
// ==========================================


// Get saved applications
let applications = JSON.parse(
    localStorage.getItem("internApplications")
) || [];


// ID of application currently being edited
let editingId = null;


// ==========================================
// OPEN FORM
// ==========================================

function openForm() {

    document.getElementById(
        "applicationForm"
    ).style.display = "flex";


    document.getElementById(
        "formTitle"
    ).textContent = "Add Application";


    document.getElementById(
        "submitButton"
    ).textContent = "Add Application";


    editingId = null;

}


// ==========================================
// CLOSE FORM
// ==========================================

function closeForm() {

    document.getElementById(
        "applicationForm"
    ).style.display = "none";


    clearForm();

}


// ==========================================
// CLEAR FORM
// ==========================================

function clearForm() {

    document.getElementById(
        "company"
    ).value = "";


    document.getElementById(
        "role"
    ).value = "";


    document.getElementById(
        "status"
    ).value = "Applied";


    document.getElementById(
        "deadline"
    ).value = "";

}


// ==========================================
// SAVE APPLICATION
// ==========================================

function saveApplication() {

    const company =
        document.getElementById(
            "company"
        ).value.trim();


    const role =
        document.getElementById(
            "role"
        ).value.trim();


    const status =
        document.getElementById(
            "status"
        ).value;


    const deadline =
        document.getElementById(
            "deadline"
        ).value;


    // Check required fields
    if (
        company === "" ||
        role === ""
    ) {

        alert(
            "Please enter company name and internship role."
        );

        return;
    }


    // EDIT
    if (editingId !== null) {

        const application =
            applications.find(function(item) {

                return item.id === editingId;

            });


        if (application) {

            application.company =
                company;

            application.role =
                role;

            application.status =
                status;

            application.deadline =
                deadline;
        }

    }


    // ADD
    else {

        const newApplication = {

            id: Date.now(),

            company: company,

            role: role,

            status: status,

            deadline: deadline

        };


        applications.push(
            newApplication
        );

    }


    saveApplications();

    closeForm();

    displayApplications();

    updateUpcomingDeadline();

}


// ==========================================
// SAVE TO LOCAL STORAGE
// ==========================================

function saveApplications() {

    localStorage.setItem(
        "internApplications",
        JSON.stringify(
            applications
        )
    );

}


// ==========================================
// DISPLAY APPLICATIONS
// ==========================================

function displayApplications() {

    const list =
        document.getElementById(
            "applicationList"
        );


    list.innerHTML = "";


    // No applications
    if (
        applications.length === 0
    ) {

        list.innerHTML = `
            <div class="empty-message">
                <h3>📭 No applications yet</h3>
                <p>
                    Click "+ Add Application" to get started.
                </p>
            </div>
        `;


        updateStats();

        displayDeadlines();

        updateUpcomingDeadline();

        return;
    }


    // Sort by nearest deadline
    const sortedApplications =
        [...applications].sort(
            function(a, b) {

                if (
                    !a.deadline &&
                    !b.deadline
                ) {
                    return 0;
                }


                if (!a.deadline) {
                    return 1;
                }


                if (!b.deadline) {
                    return -1;
                }


                return (
                    new Date(a.deadline) -
                    new Date(b.deadline)
                );

            }
        );


    sortedApplications.forEach(
        function(application) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "application-card";


            // Store status for filtering
            card.dataset.status =
                application.status;


            // Deadline
            let deadlineText = "";


            if (
                application.deadline
            ) {

                const warning =
                    getDeadlineWarning(
                        application.deadline
                    );


                deadlineText = `

                    <p>
                        <strong>
                            Deadline:
                        </strong>

                        ${formatDate(
                            application.deadline
                        )}

                    </p>


                    <span
                        class="${warning.className}">

                        ${warning.text}

                    </span>

                `;

            }


            // Application card
            card.innerHTML = `

                <div class="button-group">

                    <button
                        class="edit-btn"
                        onclick="editApplication(${application.id})">

                        Edit

                    </button>


                    <button
                        class="delete-btn"
                        onclick="deleteApplication(${application.id})">

                        Delete

                    </button>

                </div>


                <h3>
                    ${application.company}
                </h3>


                <p class="role-text">
                    ${application.role}
                </p>


                <!-- Progress -->

                <div class="progress-status">

                    <span class="${
                        application.status === "Applied"
                            ? "active-step"
                            : ""
                    }">

                        ● Applied

                    </span>


                    <span>
                        →
                    </span>


                    <span class="${
                        application.status === "Interview"
                            ? "active-step"
                            : ""
                    }">

                        ● Interview

                    </span>


                    <span>
                        →
                    </span>


                    <span class="${
                        application.status === "Selected"
                            ? "active-step"
                            : ""
                    }">

                        ● Selected

                    </span>

                </div>


                ${deadlineText}

            `;


            list.appendChild(
                card
            );

        }
    );


    updateStats();

    displayDeadlines();

    updateUpcomingDeadline();

}


// ==========================================
// SEARCH
// ==========================================

function searchApplications() {

    filterApplications();

}


// ==========================================
// FILTER
// ==========================================

function filterApplications() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );


    const statusFilter =
        document.getElementById(
            "statusFilter"
        );


    const searchValue =
        searchInput.value
            .toLowerCase()
            .trim();


    const statusValue =
        statusFilter.value;


    const cards =
        document.querySelectorAll(
            ".application-card"
        );


    let found = false;


    cards.forEach(
        function(card) {

            const text =
                card.textContent
                    .toLowerCase();


            const cardStatus =
                card.dataset.status;


            const matchesSearch =
                text.includes(
                    searchValue
                );


            const matchesStatus =
                statusValue === "All" ||
                cardStatus === statusValue;


            if (
                matchesSearch &&
                matchesStatus
            ) {

                card.style.display =
                    "block";

                found = true;

            }
            else {

                card.style.display =
                    "none";

            }

        }
    );


    // Remove previous message
    const oldMessage =
        document.getElementById(
            "noResultMessage"
        );


    if (oldMessage) {
        oldMessage.remove();
    }


    // Nothing found
    if (!found) {

        const message =
            document.createElement(
                "div"
            );


        message.id =
            "noResultMessage";


        message.className =
            "empty-message";


        message.innerHTML = `
            <h3>🔍 No applications found</h3>
            <p>
                Try another company, role or status.
            </p>
        `;


        document
            .getElementById(
                "applicationList"
            )
            .appendChild(
                message
            );

    }

}


// ==========================================
// EDIT APPLICATION
// ==========================================

function editApplication(id) {

    const application =
        applications.find(
            function(item) {

                return item.id === id;

            }
        );


    if (!application) {
        return;
    }


    editingId = id;


    document.getElementById(
        "company"
    ).value =
        application.company;


    document.getElementById(
        "role"
    ).value =
        application.role;


    document.getElementById(
        "status"
    ).value =
        application.status;


    document.getElementById(
        "deadline"
    ).value =
        application.deadline;


    document.getElementById(
        "formTitle"
    ).textContent =
        "Edit Application";


    document.getElementById(
        "submitButton"
    ).textContent =
        "Update Application";


    document.getElementById(
        "applicationForm"
    ).style.display =
        "flex";

}


// ==========================================
// DELETE
// ==========================================

function deleteApplication(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this application?"
        );


    if (!confirmDelete) {
        return;
    }


    applications =
        applications.filter(
            function(application) {

                return application.id !== id;

            }
        );


    saveApplications();

    displayApplications();

    updateUpcomingDeadline();

}


// ==========================================
// UPDATE DASHBOARD STATS
// ==========================================

function updateStats() {

    const applicationCount =
        applications.length;


    const interviewCount =
        applications.filter(
            function(application) {

                return (
                    application.status ===
                    "Interview"
                );

            }
        ).length;


    const selectedCount =
        applications.filter(
            function(application) {

                return (
                    application.status ===
                    "Selected"
                );

            }
        ).length;


    document.getElementById(
        "applicationCount"
    ).textContent =
        applicationCount;


    document.getElementById(
        "interviewCount"
    ).textContent =
        interviewCount;


    document.getElementById(
        "selectedCount"
    ).textContent =
        selectedCount;

}


// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(dateString) {

    const date =
        new Date(
            dateString +
            "T00:00:00"
        );


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "long",
            year: "numeric"
        }
    );

}


// ==========================================
// DEADLINE WARNING
// ==========================================

function getDeadlineWarning(
    dateString
) {

    const today =
        new Date();


    today.setHours(
        0,
        0,
        0,
        0
    );


    const deadline =
        new Date(
            dateString +
            "T00:00:00"
        );


    const difference =
        deadline - today;


    const days =
        Math.ceil(
            difference /
            (1000 * 60 * 60 * 24)
        );


    if (days < 0) {

        return {

            text:
                "⚠️ Deadline passed",

            className:
                "deadline-warning deadline-passed"

        };

    }


    if (days === 0) {

        return {

            text:
                "🔴 Deadline today!",

            className:
                "deadline-warning deadline-today"

        };

    }


    if (days === 1) {

        return {

            text:
                "🟠 Deadline tomorrow",

            className:
                "deadline-warning"

        };

    }


    return {

        text:
            "📅 Deadline in " +
            days +
            " days",

        className:
            "deadline-warning"

    };

}


// ==========================================
// DEADLINES SECTION
// ==========================================

function displayDeadlines() {

    const deadlineList =
        document.getElementById(
            "deadlineList"
        );


    deadlineList.innerHTML = "";


    const deadlineApplications =
        applications
            .filter(
                function(application) {

                    return (
                        application.deadline !== ""
                    );

                }
            )
            .sort(
                function(a, b) {

                    return (
                        new Date(a.deadline) -
                        new Date(b.deadline)
                    );

                }
            );


    if (
        deadlineApplications.length === 0
    ) {

        deadlineList.innerHTML = `
            <div class="empty-message">
                <p>
                    No deadlines added yet.
                </p>
            </div>
        `;

        return;
    }


    deadlineApplications.forEach(
        function(application) {

            const warning =
                getDeadlineWarning(
                    application.deadline
                );


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "deadline-item";


            item.innerHTML = `

                <h3>
                    ${application.company}
                </h3>


                <p>
                    ${application.role}
                </p>


                <p>
                    <strong>
                        Deadline:
                    </strong>

                    ${formatDate(
                        application.deadline
                    )}

                </p>


                <span
                    class="${warning.className}">

                    ${warning.text}

                </span>

            `;


            deadlineList.appendChild(
                item
            );

        }
    );

}


// ==========================================
// UPCOMING DEADLINE
// ==========================================

function updateUpcomingDeadline() {

    const upcomingBox =
        document.getElementById(
            "upcomingDeadline"
        );


    if (!upcomingBox) {
        return;
    }


    const upcomingApplications =
        applications
            .filter(
                function(application) {

                    return (
                        application.deadline !== ""
                    );

                }
            )
            .sort(
                function(a, b) {

                    return (
                        new Date(a.deadline) -
                        new Date(b.deadline)
                    );

                }
            );


    if (
        upcomingApplications.length === 0
    ) {

        upcomingBox.innerHTML = `

            <h3>
                📅 Next Deadline
            </h3>

            <p>
                No upcoming deadlines.
            </p>

        `;

        return;
    }


    const nextApplication =
        upcomingApplications[0];


    const warning =
        getDeadlineWarning(
            nextApplication.deadline
        );


    upcomingBox.innerHTML = `

        <h3>
            📅 Next Deadline
        </h3>


        <h2>
            ${nextApplication.company}
        </h2>


        <p>
            ${nextApplication.role}
        </p>


        <p>
            <strong>
                Deadline:
            </strong>

            ${formatDate(
                nextApplication.deadline
            )}

        </p>


        <span
            class="${warning.className}">

            ${warning.text}

        </span>

    `;

}


// ==========================================
// EXPORT CSV
// ==========================================

function exportApplications() {

    if (
        applications.length === 0
    ) {

        alert(
            "No applications to export."
        );

        return;
    }


    let csv =
        "Company,Role,Status,Deadline\n";


    applications.forEach(
        function(application) {

            csv +=
                `"${application.company}","${application.role}","${application.status}","${application.deadline}"\n`;

        }
    );


    const blob =
        new Blob(
            [csv],
            {
                type:
                    "text/csv"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href = url;


    link.download =
        "InternTrack_Applications.csv";


    document.body.appendChild(
        link
    );


    link.click();


    document.body.removeChild(
        link
    );


    URL.revokeObjectURL(
        url
    );

}


// ==========================================
// INITIALIZE
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        displayApplications();

        updateStats();

        updateUpcomingDeadline();

    }
);