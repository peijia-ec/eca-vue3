<script setup>
import { useAuthService } from '@/service/useAuthService'

const { loginWithGoogle } = useAuthService()
</script>

<template>
  <div
    class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
    <div class="flex flex-col items-center justify-center">
      <div
        style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
        <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
          <div class="text-center mb-8">
            <img src="/logo.png" alt="logo" class="w-10 mx-auto mb-4" />
            <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Welcome to EC Admin</div>
            <span class="text-muted-color font-medium">Sign in to continue</span>
          </div>

          <div>
            <Button label="Sign In" class="w-full" @click="loginWithGoogle"></Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
