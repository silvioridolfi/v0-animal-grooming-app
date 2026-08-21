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
import type { Accesorio } from "@/lib/types"

interface AccesorioComboboxProps {
  accesorios: Accesorio[]
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
}

export function AccesorioCombobox({ accesorios, value, onValueChange, disabled = false }: AccesorioComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")

  const seleccionado = accesorios.find((a) => a.id === value)

  const filtrados = React.useMemo(() => {
    if (!searchValue) return accesorios
    const q = searchValue.toLowerCase()
    return accesorios.filter((a) => a.nombre.toLowerCase().includes(q))
  }, [accesorios, searchValue])

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
          <span className="truncate">{seleccionado ? seleccionado.nombre : "Selecciona un accesorio..."}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="h-4 w-4 shrink-0 opacity-50 mr-2" />
            <CommandInput
              placeholder="Busca un accesorio..."
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
            <CommandEmpty>No hay accesorios con "{searchValue}"</CommandEmpty>
            <CommandGroup>
              {filtrados.map((accesorio) => {
                const sinStock = accesorio.stock <= 0
                return (
                  <CommandItem
                    key={accesorio.id}
                    value={accesorio.nombre}
                    disabled={sinStock}
                    onSelect={() => {
                      if (sinStock) return
                      onValueChange(accesorio.id === value ? "" : accesorio.id)
                      setOpen(false)
                      setSearchValue("")
                    }}
                    className={cn(sinStock && "opacity-50")}
                  >
                    <Check className={cn("mr-2 h-4 w-4", value === accesorio.id ? "opacity-100" : "opacity-0")} />
                    <span className="flex-1">{accesorio.nombre}</span>
                    <span className={cn("text-xs ml-2", sinStock ? "text-destructive" : "text-muted-foreground")}>
                      {sinStock ? "Sin stock" : `${accesorio.stock} disp.`}
                    </span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
