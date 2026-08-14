<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('check:schema')]
#[Description('Command description')]
class CheckSchema extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        //
    }
}
