import { FaGithub, FaLinkedin } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 py-6 rounded-lg">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between px-6 text-gray-400">
        <p className="text-sm text-center sm:text-left">
          © {new Date().getFullYear()} Devansh Tandon. All rights reserved.
        </p>

        <div className="flex gap-6 mt-3 sm:mt-0">
          <a
            href="https://github.com/t-devansh"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            <FaGithub size={22} />
          </a>
          <a
            href="https://linkedin.com/in/devanshtandon"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-400 transition-colors"
          >
            <FaLinkedin size={22} />
          </a>
        </div>
      </div>
    </footer>
  );
}
