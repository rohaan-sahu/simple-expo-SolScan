
import { StyleSheet } from "react-native";

export const mintStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a1a",
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0a0a1a",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 8,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#1a1a2e",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardLabel: {
    color: "#888",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  mintAddress: {
    color: "#9945FF",
    fontSize: 13,
    fontFamily: "monospace",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  infoLabel: {
    color: "#888",
    fontSize: 14,
  },
  infoValue: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#2a2a3e",
  },
  linkButton: {
    backgroundColor: "#9945FF20",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  linkButtonText: {
    color: "#9945FF",
    fontSize: 14,
    fontWeight: "600",
  },
});