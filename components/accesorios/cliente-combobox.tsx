"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { Cliente } from "@/lib/types"

interface ClienteComboboxProps {
  clientes: Cliente[]
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
}

export function ClienteCombobox({ clientes, value, onValueChange, disabled = false }: ClienteComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")

  const seleccionado = clientes.find((c) => c.id === value)

  const filtrados = React.useMemo(() => {
    if (!searchValue) return clientes
    const q = searchValue.toLowerCase()
    return clientes.filter((c) => c.nombre.toLowerCase().includes(q))
  }, [clientes, searchValue])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between bg-background"
        >
          <span className="truncate">{seleccionado ? seleccionado.nombre : "Sin cliente (venta suelta)"}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="h-4 w-4 shrink-0 opacity-50 mr-2" />
            <CommandInput
              placeholder="Busca un cliente..."
              value={searchValue}
              onValueChange={setSearchValue}
              className="border-0"
            />
            {searchValue && (
              <button onClick={() => setSearchValue("")} className="ml-auto opacity-50 hover:opacity-100 transition-opacity">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <CommandList className="max-h-64">
            <CommandGroup>
              <CommandItem
                value="__sin_cliente__"
                onSelect={() => {
                  onValueChange("")
                  setOpen(false)
                  setSearchValue("")
                }}
              >
                <Check className={cn("mr-2 h-4 w-4", value === "" ? "opacity-100" : "opacity-0")} />
                Sin cliente (venta suelta)
              </CommandItem>
            </CommandGroup>
            <CommandEmpty>No hay clientes con "{searchValue}"</CommandEmpty>
            <CommandGroup>
              {filtrados.map((cliente) => (
                <CommandItem
                  key={cliente.id}
                  value={cliente.nombre}
                  onSelect={() => {
                    onValueChange(cliente.id === value ? "" : cliente.id)
                    setOpen(false)
                    setSearchValue("")
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === cliente.id ? "opacity-100" : "opacity-0")} />
                  {cliente.nombre}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
