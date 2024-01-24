// import React, { useState } from 'react';

// const ProjectStructureView = ({ projectStructure }) => {
//   const [selectedPath, setSelectedPath] = useState('');

//   const handleItemClick = (path) => {
//     setSelectedPath(path);
//   };

//   const renderEntries = (entries, parentPath = '') => (
//     <ul>
//       {entries.map((entry, index) => (
//         <li key={index}>
//           <span
//             style={{ cursor: 'pointer', textDecoration: 'underline', color: 'blue' }}
//             onClick={() => handleItemClick(parentPath + entry.path)}
//           >
//             {entry.name}
//           </span>
//           {entry.sequences && renderEntries(entry.sequences, parentPath + entry.path + '/')}
//           {entry.endpoints && renderEntries(entry.endpoints, parentPath + entry.path + '/')}
//         </li>
//       ))}
//     </ul>
//   );

//   const renderDirectory = (directory) => (
//     <div key={directory}>
//       <h3>{directory}</h3>
//       {renderEntries(projectStructure[directory])}
//     </div>
//   );

//   return (
//     <div>
//       {Object.keys(projectStructure).map((directory) => renderDirectory(directory))}
//       {selectedPath && (
//         <div>
//           <strong>Selected Path:</strong> {selectedPath}
//         </div>
//       )}
//     </div>
//   );
// };

// export default ProjectStructureView;
