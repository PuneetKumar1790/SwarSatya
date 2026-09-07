# SwarSatya — Environment & Installation Reference (SIH #26104)

This file contains the complete record of installed runtimes, paths, versions, and configuration instructions for the SwarSatya project on this machine.

---

## 1. System Hardware Specifications

| Component | Specification |
| :--- | :--- |
| **CPU** | Intel Core i3-7020U @ 2.30 GHz (2 Cores, 4 Logical Processors) |
| **GPU** | Intel HD Graphics 620 (Integrated only, no dedicated NVIDIA CUDA) |
| **RAM** | 12 GB DDR4 (11.91 GB Total, ~5.5 GB Free) |
| **Storage** | `C:\`: ~138 GB free \| `D:\`: ~491 GB free |
| **Operating System** | Windows 10 Pro 64-bit |

---

## 2. Installed Runtimes & Paths

### Python 3.11.9 (64-bit)
- **Binary Path**: `C:\Users\Raju\AppData\Local\Programs\Python\Python311\python.exe`
- **Pip Path**: `C:\Users\Raju\AppData\Local\Programs\Python\Python311\Scripts\pip.exe`
- **Configured in User PATH**: Yes

### Node.js LTS (v20.18.0) & npm (10.8.2)
- **Node Binary**: `C:\Users\Raju\AppData\Local\Programs\node-v20.18.0-win-x64\node.exe`
- **npm CLI**: `C:\Users\Raju\AppData\Local\Programs\node-v20.18.0-win-x64\npm.cmd`
- **Configured in User PATH**: Yes

---

## 3. Project Structure & Virtual Environment

### Workspace Root
`D:\Puneet\Swar`

### Backend
- **Location**: `D:\Puneet\Swar\backend`
- **Virtual Environment (`venv`)**: `D:\Puneet\Swar\backend\venv`
- **Venv Python Interpreter**: `D:\Puneet\Swar\backend\venv\Scripts\python.exe`
- **Venv Pip Executable**: `D:\Puneet\Swar\backend\venv\Scripts\pip.exe`
- **Activation Script**: `D:\Puneet\Swar\backend\venv\Scripts\Activate.ps1`

#### Installed Backend Packages & Versions:
- **PyTorch (CPU-optimized)**: `torch==2.2.2+cpu`
- **Torchaudio**: `torchaudio==2.2.2+cpu`
- **Web & API Framework**: `fastapi`, `uvicorn`, `websockets`, `python-multipart`
- **Automatic Speech Recognition (ASR)**: `faster-whisper==1.2.1` (powered by `ctranslate2==4.8.2` and `av==18.1.0`)
- **Audio Processing**: `soundfile`, `librosa`, `scipy`
- **Machine Learning**: `transformers`, `huggingface-hub`, `tokenizers`, `scikit-learn`
- **Array Computing**: `numpy<2` (1.26.4 for PyTorch compatibility)

### Frontend
- **Location**: `D:\Puneet\Swar\frontend`
- **Framework**: React 18 + Vite 6
- **Installed Packages (`node_modules`)**:
  - `react`, `react-dom`
  - `recharts` (for live real-time risk timeline graph)
  - `lucide-react` (icons and alert badges)
  - `@vitejs/plugin-react`

---

## 4. How to Run Applications

### Starting Backend:
```powershell
# From D:\Puneet\Swar
& "D:\Puneet\Swar\backend\venv\Scripts\python.exe" -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Starting Frontend:
```powershell
# From D:\Puneet\Swar\frontend
$env:Path = "C:\Users\Raju\AppData\Local\Programs\node-v20.18.0-win-x64;" + $env:Path
npm run dev
```

---

## 5. Performance Recommendations for this Machine
1. **CPU Only**: Always specify `device="cpu"` and `compute_type="int8"` for `faster-whisper` to maintain real-time latency (~0.4s per chunk).
2. **Audio Chunking**: Buffer 3–5 second audio chunks and run analysis in async worker threads so WebRTC streaming remains responsive.
