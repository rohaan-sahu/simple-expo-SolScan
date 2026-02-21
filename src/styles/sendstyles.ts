import { StyleSheet } from "react-native";

export const sendStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a1a", padding: 16, paddingTop: 60 },
  center: {
    flex: 1, backgroundColor: "#0a0a1a",
    justifyContent: "center", alignItems: "center", padding: 40,
  },
  emptyTitle: { color: "#fff", fontSize: 20, fontWeight: "bold", marginTop: 16 },
  emptyText: { color: "#666", fontSize: 14, textAlign: "center", marginTop: 8 },
  header: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 24,
  },
  title: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  card: {
    backgroundColor: "#1a1a2e", borderRadius: 12, padding: 16, marginBottom: 20,
  },
  cardLabel: { color: "#888", fontSize: 12, textTransform: "uppercase", marginBottom: 4 },
  cardAddress: { color: "#9945FF", fontSize: 14, fontFamily: "monospace" },
  inputGroup: { marginBottom: 16 },
  inputLabel: { color: "#888", fontSize: 12, textTransform: "uppercase", marginBottom: 8 },
  input: {
    backgroundColor: "#1a1a2e", color: "#fff", padding: 16,
    borderRadius: 12, fontSize: 16, borderWidth: 1, borderColor: "#2a2a3e",
  },
  sendButton: {
    backgroundColor: "#14F195", padding: 16, borderRadius: 12,
    alignItems: "center", marginTop: 8,
  },
  sendButtonDisabled: { opacity: 0.5 },
  sendButtonText: { color: "#0a0a1a", fontSize: 18, fontWeight: "bold" },
  feeText: { color: "#555", fontSize: 12, textAlign: "center", marginTop: 12 },
  backButton: {
    backgroundColor: "#9945FF", paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: 10, marginTop: 16,
  },
  backButtonText: { color: "#fff", fontWeight: "bold" },
});
