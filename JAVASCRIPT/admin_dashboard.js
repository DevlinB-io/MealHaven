// Admin Dashboard JavaScript
console.log("=== Admin Dashboard Loaded ===");

class AdminDashboard {
  constructor() {
    this.users = [];
    this.currentPage = 1;
    this.usersPerPage = 10;
    this.init();
  }

  async init() {
    // Check if admin is logged in
    if (!this.checkAdminAuth()) {
      window.location.href = "admin_login.html";
      return;
    }

    this.setupEventListeners();
    await this.loadDashboardData();
    this.updateWelcomeMessage();
  }

  checkAdminAuth() {
    const isLoggedIn = localStorage.getItem("admin_logged_in") === "true";
    if (!isLoggedIn) {
      // Also check session
      return false;
    }
    return true;
  }

  setupEventListeners() {
    // Logout button
    document.getElementById("logoutBtn").addEventListener("click", () => {
      this.logout();
    });

    // Refresh button
    document.getElementById("refreshBtn").addEventListener("click", () => {
      this.loadDashboardData();
    });

    // Search functionality
    document.getElementById("userSearch").addEventListener("input", (e) => {
      this.filterUsers(e.target.value);
    });

    // Export button
    document.getElementById("exportUsers").addEventListener("click", () => {
      this.exportUsersToCSV();
    });

    // Delete modal buttons
    document.getElementById("cancelDelete").addEventListener("click", () => {
      document.getElementById("deleteUserModal").close();
    });

    document.getElementById("confirmDelete").addEventListener("click", () => {
      this.confirmDeleteUser();
    });
  }

  updateWelcomeMessage() {
    const adminName = localStorage.getItem("admin_name") || "Admin";
    document.getElementById(
      "adminWelcome"
    ).textContent = `Welcome, ${adminName}`;
  }

  async loadDashboardData() {
    try {
      await Promise.all([this.loadUsers(), this.loadStatistics()]);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      alert("Error loading dashboard data");
    }
  }

  async loadUsers() {
    try {
      const response = await fetch("../PHP/get_users.php");
      const result = await response.json();

      if (result.success) {
        this.users = result.users;
        this.renderUsers();
      } else {
        throw new Error(result.error || "Failed to load users");
      }
    } catch (error) {
      console.error("Error loading users:", error);
      this.showError("Failed to load users");
    }
  }

  async loadStatistics() {
    try {
      const response = await fetch("../PHP/get_admin_stats.php");
      const result = await response.json();

      if (result.success) {
        this.updateStatistics(result.stats);
      } else {
        throw new Error(result.error || "Failed to load statistics");
      }
    } catch (error) {
      console.error("Error loading statistics:", error);
    }
  }

  updateStatistics(stats) {
    document.getElementById("totalUsers").textContent = stats.total_users || 0;
    document.getElementById("activeUsers").textContent =
      stats.active_users || 0;
    document.getElementById("recipesCount").textContent =
      stats.total_recipes || 0;
    document.getElementById("recentUsers").textContent =
      stats.recent_users || 0;
  }

  renderUsers() {
    const tbody = document.getElementById("usersTableBody");
    tbody.innerHTML = "";

    if (this.users.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="8" class="text-center">No users found</td></tr>';
      return;
    }

    this.users.forEach((user) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
                <td>${user.USER_ID}</td>
                <td>${user.USER_FIRST_NAME} ${user.USER_LAST_NAME}</td>
                <td>${user.USER_EMAIL_ADDRESS}</td>
                <td>${user.USER_PHONE_NUMBER || "—"}</td>
                <td>${this.formatDate(user.USER_ACCOUNT_CREATED_AT)}</td>
                <td>${user.recipe_count || 0}</td>
                <td><span class="status-badge active">Active</span></td>
                <td>
                    <button class="btn danger btn-sm" onclick="adminDashboard.deleteUser(${
                      user.USER_ID
                    }, '${user.USER_FIRST_NAME} ${user.USER_LAST_NAME}')">
                        Delete
                    </button>
                </td>
            `;
      tbody.appendChild(tr);
    });
  }

  filterUsers(searchTerm) {
    const filteredUsers = this.users.filter((user) => {
      const searchText = searchTerm.toLowerCase();
      return (
        user.USER_FIRST_NAME.toLowerCase().includes(searchText) ||
        user.USER_LAST_NAME.toLowerCase().includes(searchText) ||
        user.USER_EMAIL_ADDRESS.toLowerCase().includes(searchText) ||
        user.USER_PHONE_NUMBER?.includes(searchTerm)
      );
    });

    // Re-render with filtered users
    const originalUsers = this.users;
    this.users = filteredUsers;
    this.renderUsers();
    this.users = originalUsers; // Restore original array
  }

  deleteUser(userId, userName) {
    this.userToDelete = userId;
    document.getElementById(
      "deleteUserText"
    ).textContent = `Are you sure you want to delete user "${userName}"? This will permanently remove all their data including recipes, pantry items, and meal plans.`;
    document.getElementById("deleteUserModal").showModal();
  }

  async confirmDeleteUser() {
    if (!this.userToDelete) return;

    try {
      const response = await fetch("../PHP/delete_user.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: this.userToDelete }),
      });

      const result = await response.json();

      if (result.success) {
        document.getElementById("deleteUserModal").close();
        this.showSuccess("User deleted successfully");
        await this.loadDashboardData(); // Reload data
      } else {
        throw new Error(result.error || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      this.showError("Failed to delete user: " + error.message);
    }

    this.userToDelete = null;
  }

  exportUsersToCSV() {
    const headers = [
      "ID",
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Join Date",
      "Recipes",
    ];
    const csvData = [
      headers.join(","),
      ...this.users.map((user) =>
        [
          user.USER_ID,
          `"${user.USER_FIRST_NAME}"`,
          `"${user.USER_LAST_NAME}"`,
          `"${user.USER_EMAIL_ADDRESS}"`,
          `"${user.USER_PHONE_NUMBER || ""}"`,
          user.USER_ACCOUNT_CREATED_AT,
          user.recipe_count || 0,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mealhaven_users_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  logout() {
    // Clear admin session
    localStorage.removeItem("admin_logged_in");
    localStorage.removeItem("admin_user_id");
    localStorage.removeItem("admin_name");

    // Clear any session data
    fetch("../PHP/admin_logout.php")
      .then(() => {
        window.location.href = "admin_login.html";
      })
      .catch((error) => {
        console.error("Logout error:", error);
        window.location.href = "admin_login.html";
      });
  }

  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  showError(message) {
    alert("Error: " + message);
  }

  showSuccess(message) {
    alert("Success: " + message);
  }
}

// Initialize admin dashboard when page loads
const adminDashboard = new AdminDashboard();
