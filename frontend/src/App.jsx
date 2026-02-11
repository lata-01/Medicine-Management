import { useEffect, useState } from "react";

function App() {
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    id: "",
    name: "",
    quantity: "",
    price: ""
  });

  const fetchMedicines = (value = "") => {
    fetch(`http://localhost:8000/medicines?search=${value}`)
      .then((res) => res.json())
      .then((data) => setMedicines(data));
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ADD MEDICINE
  const addMedicine = async () => {
    try {
      const res = await fetch("http://localhost:8000/medicines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: Number(form.id),
          name: form.name,
          quantity: Number(form.quantity),
          price: Number(form.price)
        })
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.detail);
        return;
      }

      fetchMedicines(search);
      setForm({ id: "", name: "", quantity: "", price: "" });
    } catch {
      alert("Backend not reachable");
    }
  };

  // DELETE
  const deleteMedicine = async (id) => {
    await fetch(`http://localhost:8000/medicines/${id}`, {
      method: "DELETE"
    });
    fetchMedicines(search);
  };

  // EDIT QUANTITY
  const updateQuantity = async (id, quantity) => {
    await fetch(`http://localhost:8000/medicines/${id}?quantity=${quantity}`, {
      method: "PUT"
    });
    fetchMedicines(search);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>💊 Medicine Inventory Management</h2>

        {/* Add Medicine */}
        <div style={styles.formRow}>
          <input name="id" placeholder="ID" value={form.id} onChange={handleChange} />
          <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
          <input name="quantity" placeholder="Qty" value={form.quantity} onChange={handleChange} />
          <input name="price" placeholder="Price" value={form.price} onChange={handleChange} />
          <button style={styles.addBtn} onClick={addMedicine}>Add</button>
        </div>

        {/* Search */}
        <input
          style={styles.search}
          placeholder="🔍 Search medicine..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            fetchMedicines(e.target.value);
          }}
        />

        {/* Table */}
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.center}>ID</th>
              <th style={styles.left}>Name</th>
              <th style={styles.center}>Quantity</th>
              <th style={styles.center}>Price</th>
              <th style={styles.center}>Status</th>
              <th style={styles.center}>Action</th>
            </tr>
          </thead>

          <tbody>
            {medicines.map((med) => {
              const low = med.quantity < 45;
              return (
                <tr key={med.id} style={{ backgroundColor: low ? "#fff3cd" : "white" }}>
                  <td style={styles.center}>{med.id}</td>
                  <td style={styles.left}>{med.name}</td>

                  {/* Editable quantity */}
                  <td style={styles.center}>
                    <input
                      type="number"
                      defaultValue={med.quantity}
                      style={{ width: "60px" }}
                      onBlur={(e) =>
                        updateQuantity(med.id, e.target.value)
                      }
                    />
                  </td>

                  <td style={styles.center}>₹{med.price}</td>

                  <td style={styles.center}>
                    <span style={low ? styles.low : styles.ok}>
                      {low ? "Low Stock" : "In Stock"}
                    </span>
                  </td>

                  <td style={styles.center}>
                    <button
                      style={styles.deleteBtn}
                      onClick={() => deleteMedicine(med.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  page: {
    backgroundColor: "#f4f6f8",
    minHeight: "100vh",
    padding: "40px",
    fontFamily: "Segoe UI, Arial"
  },
  card: {
    backgroundColor: "#ffffff",
    maxWidth: "1000px",
    margin: "auto",
    padding: "25px",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
  },
  title: { textAlign: "center", marginBottom: "20px" },
  formRow: { display: "flex", gap: "10px", marginBottom: "15px", flexWrap: "wrap" },
  addBtn: { backgroundColor: "#007bff", color: "white", border: "none", padding: "8px 16px" },
  search: { width: "100%", padding: "10px", marginBottom: "15px" },
  table: { width: "100%", borderCollapse: "collapse" },
  left: { textAlign: "left", padding: "12px", borderBottom: "1px solid #e0e0e0" },
  center: { textAlign: "center", padding: "12px", borderBottom: "1px solid #e0e0e0" },
  low: { color: "#856404", fontWeight: "bold" },
  ok: { color: "green", fontWeight: "bold" },
  deleteBtn: {
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "4px",
    cursor: "pointer"
  }
};

export default App;
