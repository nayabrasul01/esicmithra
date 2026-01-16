import Header from "../components/Header";
import Footer from "../components/Footer";

const MainLayout = ({ children }) => {
  return (
    <div style={styles.wrapper}>
      <Header />

      <main style={styles.main}>
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;

const styles = {
  wrapper: {
    width: "100vw",      // FULL SCREEN
    minHeight: "100vh"
  },
  main: {
    width: "100%",
    padding: "20px"
  }
};

