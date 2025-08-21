<template>
  <div class="language-switcher">
    <!-- 统一下拉菜单（移动端和桌面端） -->
    <div class="dropdown dropdown-end">
      <label tabindex="0" class="btn btn-ghost btn-sm gap-2">
        <span class="text-lg">{{ getLocaleFlag(currentLocale) }}</span>
        <span class="hidden md:inline">{{ getLocaleName(currentLocale) }}</span>
        <svg class="w-4 h-4 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </label>

      <ul tabindex="0"
        class="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-box w-48 border border-gray-200 z-50">
        <li class="menu-title">
          <span>{{ $t('header.languageSwitch') }}</span>
        </li>
        <li v-for="locale in SUPPORTED_LOCALES" :key="locale.code">
          <a @click="switchLanguage(locale.code)" :class="{ 'active': locale.code === currentLocale }"
            class="flex items-center gap-3">
            <span class="text-lg">{{ locale.flag }}</span>
            <span>{{ locale.name }}</span>
            <svg v-if="locale.code === currentLocale" class="w-4 h-4 text-primary ml-auto" fill="none"
              stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </a>
        </li>
      </ul>
    </div>



    <!-- 语言切换动画提示 -->
    <Transition name="language-toast">
      <div v-if="showToast" class="language-toast">
        <div class="alert alert-success-custom shadow-md">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <div class="text-sm">{{ toastMessage }}</div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  SUPPORTED_LOCALES,
  setLocale,
  getCurrentLocale,
  getLocaleName,
  getLocaleFlag,
  type SupportedLocale
} from '@/i18n'

// 响应式数据
const showToast = ref(false)
const toastMessage = ref('')

// i18n
const { t } = useI18n()

// 计算属性
const currentLocale = computed(() => getCurrentLocale())

// 方法
const switchLanguage = async (locale: SupportedLocale) => {
  if (locale === currentLocale.value) {
    // 关闭下拉菜单
    const activeElement = document.activeElement as HTMLElement
    if (activeElement) {
      activeElement.blur()
    }
    return
  }

  try {
    // 显示切换动画
    const oldLocaleName = getLocaleName(currentLocale.value)
    const newLocaleName = getLocaleName(locale)

    // 切换语言
    setLocale(locale)

    // 关闭下拉菜单 - 通过移除焦点
    const activeElement = document.activeElement as HTMLElement
    if (activeElement) {
      activeElement.blur()
    }

    // 显示成功提示
    toastMessage.value = `${oldLocaleName} → ${newLocaleName}`
    showToast.value = true

    // 3秒后隐藏提示
    setTimeout(() => {
      showToast.value = false
    }, 3000)

    // 触发自定义事件
    emit('language-changed', locale)

    console.log(`Language switched from ${oldLocaleName} to ${newLocaleName}`)
  } catch (error) {
    console.error('Failed to switch language:', error)
  }
}

// 键盘快捷键支持
const handleKeydown = (event: KeyboardEvent) => {
  // Alt + L 打开语言切换
  if (event.altKey && event.key === 'l') {
    event.preventDefault()
    // 聚焦到语言切换按钮
    const languageButton = document.querySelector('.language-switcher label') as HTMLElement
    if (languageButton) {
      languageButton.focus()
    }
  }

  // ESC 关闭下拉菜单
  if (event.key === 'Escape') {
    const activeElement = document.activeElement as HTMLElement
    if (activeElement) {
      activeElement.blur()
    }
  }
}

// Emits
const emit = defineEmits<{
  'language-changed': [locale: SupportedLocale]
}>()

// 生命周期
onMounted(() => {
  // 添加键盘事件监听
  document.addEventListener('keydown', handleKeydown)

  // 组件卸载时清理
  return () => {
    document.removeEventListener('keydown', handleKeydown)
  }
})

// 暴露方法给父组件
defineExpose({
  switchLanguage,
  getCurrentLocale: () => currentLocale.value
})
</script>

<style scoped>
.language-switcher {
  position: relative;
}

.language-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  max-width: 240px;
}

/* 自定义成功提示样式 */
.alert-success-custom {
  @apply bg-green-50 border border-green-200 text-green-800;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* 语言切换提示动画 */
.language-toast-enter-active,
.language-toast-leave-active {
  transition: all 0.3s ease;
}

.language-toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.language-toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* 下拉菜单样式增强 */
.dropdown-content {
  animation: dropdown-appear 0.2s ease-out;
}

@keyframes dropdown-appear {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 移动端模态框样式 */
.modal-backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}

/* 活跃状态样式 */
.menu li>a.active {
  @apply bg-primary text-primary-content;
}

/* 响应式调整 */
@media (max-width: 640px) {
  .language-toast {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }

  .alert-success-custom {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
  }
}

/* 无障碍性增强 */
.btn:focus-visible {
  @apply ring-2 ring-primary ring-offset-2;
}

.dropdown-content li>a:focus {
  @apply bg-primary/10;
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  .dropdown-content {
    @apply border-2 border-gray-800;
  }

  .alert {
    @apply border border-gray-800;
  }
}

/* 减少动画模式支持 */
@media (prefers-reduced-motion: reduce) {

  .language-toast-enter-active,
  .language-toast-leave-active {
    transition: none;
  }

  .dropdown-content {
    animation: none;
  }
}
</style>
