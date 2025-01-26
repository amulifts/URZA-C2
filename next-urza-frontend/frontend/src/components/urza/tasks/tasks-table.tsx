"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Download, Upload } from 'lucide-react'
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

// Sample data - in a real app, this would come from an API
const tasksData = [

  // Privilege Escalation

  {
    name: "alwaysinstallelevated",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Check if the AlwaysInstallElevated Registry Key is set.",
    category: "privilege"
  },
  {
    name: "uactokenmagic",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Bypasses UAC through token duplication and spawns a specified process.",
    category: "privilege"
  },
  {
    name: "uaccomputerdefaults",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Bypasses UAC using Device Manager through Management Console.",
    category: "privilege"
  },
  {
    name: "uaceventvwr",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Bypasses UAC by performing an image hijack on the .msc file extension.",
    category: "privilege"
  },
  {
    name: "uacfodhelper",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Bypasses UAC using Manage Optional Features in Windows Settings.",
    category: "privilege"
  },
  {
    name: "uacsilentcleanup",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Bypasses UAC using the 'SilentCleanup' task in Task Scheduler.",
    category: "privilege"
  },
  {
    name: "modifiableregistryautoruns",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Looks for modifiable AutoRun registry keys.",
    category: "privilege"
  },
  {
    name: "modifiableservicebinaries",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Finds modifiable service binaries for privilege escalation.",
    category: "privilege"
  },
  {
    name: "modifiableserviceregistry",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Finds modifiable service registry keys for privilege escalation.",
    category: "privilege"
  },
  {
    name: "modifiableservices",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Finds modifiable services for privilege escalation.",
    category: "privilege"
  },
  {
    name: "kerberoasting",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Performs kerberoasting.",
    category: "privilege"
  },
  {
    name: "getsystem",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Impersonates the SYSTEM user (requires Admin).",
    category: "privilege"
  },

  // Persistence

  {
    name: "hijackclsidpersistence",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Hijacks a CLSID key to execute a payload.",
    category: "persistence"
  },
  {
    name: "keepasspersistence",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Adds a backdoor in KeePass.",
    category: "persistence"
  },
  {
    name: "servicepersistence",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Adds a backdoor using a new service.",
    category: "persistence"
  },
  {
    name: "startupfolderpersistence",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Adds a backdoor using an LNK file in the user startup folder.",
    category: "persistence"
  },
  {
    name: "tortoisesvnpersistence",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Adds a backdoor using a Tortoise SVN hook script.",
    category: "persistence"
  },
  {
    name: "wmipersistence",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Creates a WMI Event, Consumer, and Binding to execute a payload.",
    category: "persistence"
  },

  // Lateral Movement

  {
    name: "dcom",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Move laterally using DCOM.",
    category: "lateral"
  },
  {
    name: "winrm",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Move laterally using WinRM.",
    category: "lateral"
  },
  {
    name: "wmi",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Move laterally using WMI.",
    category: "lateral"
  },
  {
    name: "WMIExecHash",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Executes remote code using WMI with NTLM Hash.",
    category: "lateral"
  },

  // Credential Dumping and Phishing

  {
    name: "cachedgpp",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Finds cached GPP passwords.",
    category: "credentials"
  },
  {
    name: "credphisher",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Prompts the current user for credentials.",
    category: "credentials"
  },
  {
    name: "dumpvaultcreds",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Dumps Windows Vault credentials, including cleartext web credentials for IE/Edge.",
    category: "credentials"
  },
  {
    name: "mimikatz",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Loads Mimikatz in memory to execute commands.",
    category: "credentials"
  },
  {
    name: "minidump",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Creates an LSASS memory dump and parses it for credentials using Pypykatz.",
    category: "credentials"
  },
  {
    name: "internalmonologue",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Executes the Internal Monologue attack to retrieve Net-NTLMv1 hashes.",
    category: "credentials"
  },

  // Information Gathering

  {
    name: "domaincomputers",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Retrieve domain computers information.",
    category: "information"
  },
  {
    name: "domaingroups",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Retrieve domain groups information.",
    category: "information"
  },
  {
    name: "domainquery",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Perform LDAP queries on the domain.",
    category: "information"
  },
  {
    name: "domainusers",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Retrieve domain users information.",
    category: "information"
  },
  {
    name: "getdrives",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Gets a list of drives on the system.",
    category: "information"
  },
  {
    name: "getregistrykey",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Gets the entries or values of a RegistryKey.",
    category: "information"
  },
  {
    name: "getremoteregistrykey",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Gets the entries or values of a RegistryKey on a remote machine.",
    category: "information"
  },
  {
    name: "netcomputerstarttime",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Queries a host for start time information.",
    category: "information"
  },
  {
    name: "netcomputerversion",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Gets computer and OS version information.",
    category: "information"
  },
  {
    name: "netlocalgroupmembers",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Gets a list of local group members on a remote computer.",
    category: "information"
  },
  {
    name: "netlocalgroups",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Gets a list of local groups on a remote computer.",
    category: "information"
  },
  {
    name: "netloggedonusers",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Gets a list of logged-on users from a remote computer.",
    category: "information"
  },
  {
    name: "netsessions",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Gets session information from a remote computer.",
    category: "information"
  },
  {
    name: "netshare",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Gets a list of shares from a remote computer.",
    category: "information"
  },
  {
    name: "specialtokengroupprivs",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Retrieves special user privileges.",
    category: "information"
  },
  {
    name: "whoami",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Gets the username of the currently used or impersonated token.",
    category: "information"
  },

  // Execution

  {
    name: "excel4dcom",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Injects shellcode into Excel.exe using Excel 4.0 macros.",
    category: "execution"
  },
  {
    name: "excelshellinject",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Executes arbitrary shellcode using Excel COM objects.",
    category: "execution"
  },
  {
    name: "execute-assembly",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Executes a .NET assembly in memory.",
    category: "execution"
  },
  {
    name: "powershell",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Executes arbitrary PowerShell in an unmanaged runspace.",
    category: "execution"
  },
  {
    name: "shell",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Runs a shell command.",
    category: "execution"
  },
  {
    name: "shellcode",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Injects shellcode using the specified technique.",
    category: "execution"
  },

  // Surveillance and Monitoring

  {
    name: "clipboardmonitor",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Monitors the clipboard.",
    category: "surveillance"
  },
  {
    name: "keylogger",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Grabs keystrokes for a specified time.",
    category: "surveillance"
  },
  {
    name: "screenshot",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Takes a screenshot of the current desktop.",
    category: "surveillance"
  },
  {
    name: "recentfiles",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Parses 'recent files' shortcuts.",
    category: "surveillance"
  },
  
  
  // Miscellaneous
  {
    name: "amsipatch",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Disables AMSI in the current process.",
    category: "miscellaneous"
  },
  {
    name: "cd",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Changes the current working directory.",
    category: "miscellaneous"
  },
  {
    name: "ls",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Gets a directory listing.",
    category: "miscellaneous"
  },
  {
    name: "maketoken",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Ends token impersonation, reverting to the initial token.",
    category: "miscellaneous"
  },
  {
    name: "mouseshaker",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Shakes the mouse.",
    category: "miscellaneous"
  },
  {
    name: "msgbox",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Pops up a message box.",
    category: "miscellaneous"
  },
  {
    name: "pathhijack",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Identifies modifiable folders in `%PATH%`.",
    category: "miscellaneous"
  },
  {
    name: "portscanner",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Scans for open ports on a local or remote machine.",
    category: "miscellaneous"
  },
  {
    name: "rdp",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Enables or disables RDP on localhost via a registry key.",
    category: "miscellaneous"
  },
  {
    name: "seatbelt",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Performs host-survey 'safety checks'.",
    category: "miscellaneous"
  },
  {
    name: "setregistrykey",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Sets a value in the registry.",
    category: "miscellaneous"
  },
  {
    name: "setremoteregistrykey",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Sets a value in the registry on a remote machine.",
    category: "miscellaneous"
  },
  {
    name: "testav",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Tests if an antivirus is installed.",
    category: "miscellaneous"
  },
  {
    name: "thunderstruck",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Plays 'Thunderstruck' as loud as possible.",
    category: "miscellaneous"
  },
  {
    name: "unattendedinstallfiles",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Finds unattended install files.",
    category: "miscellaneous"
  },
  {
    name: "rick-astley",
    language : "BOO Programming Language",
    referenceSourceLibraries: "",
    description: "Never Gonna Give You Up!",
    category: "miscellaneous"
  }
]

interface TasksTableProps {
  category: string;
}

export function TasksTable({ category }: TasksTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const itemsPerPage = 10

  const filteredData = tasksData
    .filter(task => task.category === category)
    .filter(task =>
      task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())
    )

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredData.slice(startIndex, startIndex + itemsPerPage)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="space-x-2">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Create
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
        <Input
          placeholder="Search..."
          className="w-64"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>ReferenceSourceLibraries</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {getCurrentPageData().map((task, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Link 
                    href="#" 
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {task.name}
                  </Link>
                </TableCell>
                <TableCell>{task.language}</TableCell>
                <TableCell>{task.referenceSourceLibraries}</TableCell>
                <TableCell>{task.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-end">
        <Pagination className="justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#" 
                onClick={(e) => {
                  e.preventDefault()
                  setCurrentPage(prev => Math.max(prev - 1, 1))
                }}
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink 
                  href="#" 
                  isActive={currentPage === i + 1}
                  onClick={(e) => {
                    e.preventDefault()
                    setCurrentPage(i + 1)
                  }}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext 
                href="#" 
                onClick={(e) => {
                  e.preventDefault()
                  setCurrentPage(prev => Math.min(prev + 1, totalPages))
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}

