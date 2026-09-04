const fs = require('fs');

let content = fs.readFileSync('resources/js/Layouts/AdminLayout.jsx', 'utf8');

// The mapping of material names to Lucide icons
const iconMap = {
    'analytics': '<BarChart2 className="w-5 h-5" />',
    'monitoring': '<Activity className="w-5 h-5" />',
    'request_quote': '<FileText className="w-5 h-5" />',
    'local_shipping': '<Truck className="w-5 h-5" />',
    'attachment': '<Paperclip className="w-5 h-5" />',
    'group': '<Users className="w-5 h-5" />',
    'dataset': '<Database className="w-5 h-5" />',
    'expand_more': '<ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isMasterOpen ? \'rotate-180\' : \'\'}`} />', // Need to handle isMasterOpen and isPengaturanOpen dynamically later, wait.
    'park': '<TreePine className="w-4 h-4" />',
    'map': '<Map className="w-4 h-4" />',
    'business': '<Building className="w-4 h-4" />',
    'location_on': '<MapPin className="w-4 h-4" />',
    'list_alt': '<ClipboardList className="w-4 h-4" />',
    'grid_on': '<Grid className="w-4 h-4" />',
    'settings': '<Settings className="w-5 h-5" />',
    'history': '<History className="w-4 h-4" />',
    'cloud_download': '<DownloadCloud className="w-4 h-4" />',
    'error': '<AlertTriangle className="w-4 h-4" />',
    'logout': '<LogOut className="w-5 h-5" />',
    'menu': '<Menu className="w-6 h-6" />',
    'sync': '<RefreshCw className="w-5 h-5" />',
    'notifications': '<Bell className="w-5 h-5" />',
};

const expandMaster = '<ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isMasterOpen ? \'rotate-180\' : \'\'}`} />';
const expandPengaturan = '<ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isPengaturanOpen ? \'rotate-180\' : \'\'}`} />';

content = content.replace(/<span className={`material-symbols-outlined transition-transform duration-200 \${isMasterOpen \? 'rotate-180' : ''}`}>expand_more<\/span>/g, expandMaster);
content = content.replace(/<span className={`material-symbols-outlined transition-transform duration-200 \${isPengaturanOpen \? 'rotate-180' : ''}`}>expand_more<\/span>/g, expandPengaturan);

// Replace small icons
content = content.replace(/<span className="material-symbols-outlined text-sm">(.*?)<\/span>/g, (match, iconName) => {
    return iconMap[iconName] || match;
});

// Replace filled icons
content = content.replace(/<span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>(.*?)<\/span>/g, (match, iconName) => {
    return iconMap[iconName] || match;
});

// Replace plain icons
content = content.replace(/<span className="material-symbols-outlined">(.*?)<\/span>/g, (match, iconName) => {
    return iconMap[iconName] || match;
});

// Add imports for lucide-react if not exists
const lucideImports = "import { BarChart2, Activity, FileText, Truck, Paperclip, Users, Database, ChevronDown, TreePine, Map, Building, MapPin, ClipboardList, Grid, Settings, History, DownloadCloud, AlertTriangle, LogOut, Menu, RefreshCw, Bell } from 'lucide-react';\n";
if (!content.includes('lucide-react')) {
    content = content.replace("import { Link, usePage } from '@inertiajs/react';", "import { Link, usePage } from '@inertiajs/react';\n" + lucideImports);
} else {
    // maybe append to existing lucide-react?
    content = content.replace(/import \{.*?\} from 'lucide-react';/, lucideImports.trim());
}

fs.writeFileSync('resources/js/Layouts/AdminLayout.jsx', content);
console.log('Icons replaced successfully.');
